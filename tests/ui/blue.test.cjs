// Component behavior tests. Native primitives are mocked; this is NOT layout or device QA.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { create, act } = require('react-test-renderer');
const babel = require('@babel/core');
const repo = path.resolve(__dirname, '../..');
global.IS_REACT_ACT_ENVIRONMENT = true;
const storage = new Map();
let systemScheme = 'light';
let recentUsers = [];
const originalLoad = Module._load;
const primitives = ['View','Text','Image','Pressable','ScrollView','TextInput','ActivityIndicator','KeyboardAvoidingView'];
const native = Object.fromEntries(primitives.map(name => [name, name]));
Object.assign(native, {
  StyleSheet: { create: x => x, hairlineWidth: 1 },
  Platform: { OS: 'ios', select: x => x.ios ?? x.default },
  useColorScheme: () => systemScheme,
  Modal: ({visible, children}) => visible ? React.createElement('Modal', null, children) : null,
});
Module._load = function (id, parent, isMain) {
  if (id === 'react-native') return native;
  if (id === 'react-native-safe-area-context') return { useSafeAreaInsets: () => ({top:59,bottom:34,left:0,right:0}) };
  if (id === 'react-native-svg') return { __esModule:true,default:'Svg',Path:'Path',Circle:'Circle',Rect:'Rect' };
  if (id === '@react-native-async-storage/async-storage') return {
    getItem: async key => storage.get(key) ?? null,
    setItem: async (key, value) => { storage.set(key,value); },
  };
  if (id.endsWith('/userProfileService')) return { fetchRecentUsers: async () => recentUsers };
  if (id.endsWith('/sharePost')) return { getPostShareUrl: id => `https://example.test/post/${id}` };
  if (id.endsWith('/ShareSheet')) return {__esModule:true,default:()=>null};
  return originalLoad.call(this,id,parent,isMain);
};
const originalJs = require.extensions['.js'];
require.extensions['.js'] = (module, filename) => {
  if (filename.startsWith(repo + path.sep) && !filename.includes('/node_modules/')) {
    const {code} = babel.transformSync(fs.readFileSync(filename,'utf8'), {
      filename, babelrc:false, configFile:false,
      plugins:[['@babel/plugin-transform-react-jsx',{runtime:'automatic'}],'@babel/plugin-transform-modules-commonjs'],
    });
    module._compile(code,filename);
  } else originalJs(module,filename);
};
const {ThemeProvider,useTheme} = require('../../lib/ThemeContext');
const {I18nProvider} = require('../../lib/i18n');
const {lightColors,darkColors} = require('../../lib/theme');
const Home = require('../../screens/HomeScreen').default;
const TabBar = require('../../components/TabBar').default;
const PostMenu = require('../../components/PostOptionsMenu').default;
const Avatar = require('../../components/Avatar').default;
const Overview = require('../../screens/OverviewScreen').default;
const wrap = element => React.createElement(ThemeProvider,null,React.createElement(I18nProvider,null,element));
const text = node => typeof node === 'string' ? node : node.children.map(text).join('');
const button = (root,label) => root.findAllByType('Pressable').find(n => text(n) === label);
const noop = () => {};
let trees=[];
async function render(element) { let tree; await act(async()=>{tree=create(wrap(element));});trees.push(tree);return tree; }
test.beforeEach(()=>{storage.clear();systemScheme='light';recentUsers=[];});
test.afterEach(async()=>{await act(async()=>{trees.forEach(t=>t.unmount());});trees=[];});

test('recent members exclude self and blocked users, update immediately after blocking',async()=>{
 recentUsers=[{uid:'self',name:'Я'},{uid:'anna',name:'Анна Смирнова'},{uid:'blocked',name:'Скрытый'},{uid:'alex',name:'Алексей'}];
 const props={profile:{name:'Руслан'},posts:[],userId:'self',blockedUserIds:['blocked'],onOpenMember:noop};
 const tree=await render(React.createElement(Home,props));
 let labels=tree.root.findAllByType('Pressable').map(n=>n.props.accessibilityLabel);
 assert.ok(labels.includes('Анна Смирнова'));assert.ok(labels.includes('Алексей'));
 assert.ok(!labels.includes('Я'));assert.ok(!labels.includes('Скрытый'));
 assert.ok(text(tree.root).includes('Новые участники'));assert.ok(!text(tree.root).includes('История'));
 await act(async()=>{tree.update(wrap(React.createElement(Home,{...props,blockedUserIds:['blocked','anna']})));});
 labels=tree.root.findAllByType('Pressable').map(n=>n.props.accessibilityLabel);
 assert.ok(!labels.includes('Анна Смирнова'));
});

test('notification bell, message counter and post menu keep their actions',async()=>{
 let notifications=0,messages=0,menu;
 const post={id:'p',author:'Анна',authorId:'anna',content:'Привет',likes:0,replies:[]};
 const tree=await render(React.createElement(Home,{profile:{name:'Руслан'},posts:[post],userId:'self',unreadCount:3,messagesCount:120,onOpenNotifications:()=>notifications++,onOpenMessages:()=>messages++,onOpenPostMenu:p=>menu=p}));
 const buttons=tree.root.findAllByType('Pressable');
 const bell=buttons.find(n=>n.props.accessibilityLabel==='Уведомления');
 assert.equal(text(bell),'3');
 const chat=buttons.find(n=>n.props.accessibilityLabel==='Сообщения');assert.equal(text(chat),'99+');
 await act(async()=>{bell.props.onPress();chat.props.onPress();buttons.find(n=>n.props.accessibilityLabel==='Действия с публикацией').props.onPress();});
 assert.equal(notifications,1);assert.equal(messages,1);assert.equal(menu,post);
});

test('five tabs retain overview selection for legacy sections and route taps',async()=>{
 let selected;
 const tree=await render(React.createElement(TabBar,{active:'immigration',onChange:id=>selected=id}));
 const tabs=tree.root.findAllByType('Pressable');
 assert.deepEqual(tabs.map(text),['Лента','Работа','Обзор','AI','Профиль']);
 assert.equal(tabs[2].props.accessibilityState.selected,true);
 await act(async()=>tabs[2].props.onPress());assert.equal(selected,'overview');
});

test('foreign post menu preserves report and block; own post exposes edit/delete only',async()=>{
 let reported=0,blocked=0;
 const props={visible:true,isOwn:false,onReport:()=>reported++,onBlockAuthor:()=>blocked++,onClose:noop};
 const tree=await render(React.createElement(PostMenu,props));
 assert.ok(button(tree.root,'Пожаловаться'));assert.ok(button(tree.root,'Заблокировать автора'));
 await act(async()=>{button(tree.root,'Пожаловаться').props.onPress();button(tree.root,'Заблокировать автора').props.onPress();});
 assert.equal(reported,1);assert.equal(blocked,1);
 await act(async()=>tree.update(wrap(React.createElement(PostMenu,{...props,isOwn:true,onEdit:noop,onDelete:noop}))));
 assert.ok(!button(tree.root,'Пожаловаться'));assert.ok(!button(tree.root,'Заблокировать автора'));
 assert.ok(text(tree.root).includes('Редактировать'));assert.ok(text(tree.root).includes('Удалить'));
});

test('avatar falls back to initials on missing/broken photo and retries a new URI',async()=>{
 const tree=await render(React.createElement(Avatar,{name:'Анна Смирнова'}));assert.equal(text(tree.root),'АС');
 await act(async()=>tree.update(wrap(React.createElement(Avatar,{name:'Анна Смирнова',uri:'broken'}))));
 await act(async()=>tree.root.findByType('Image').props.onError());assert.equal(text(tree.root),'АС');
 await act(async()=>tree.update(wrap(React.createElement(Avatar,{name:'Анна Смирнова',uri:'new-photo'}))));
 assert.equal(tree.root.findByType('Image').props.source.uri,'new-photo');
});

test('overview keeps resources, integration and community reachable',async()=>{
 const routes=[];const tree=await render(React.createElement(Overview,{onNavigate:id=>routes.push(id)}));
 await act(async()=>tree.root.findAllByType('Pressable').forEach(n=>n.props.onPress()));
 assert.deepEqual(routes,['resources','immigration','networking']);
});

test('system follows dark scheme; explicit preference persists after remount',async()=>{
 systemScheme='dark';let theme;
 function ReadTheme(){theme=useTheme();return null;}
 const tree=await render(React.createElement(ReadTheme));assert.equal(theme.resolvedMode,'dark');
 await act(async()=>theme.setThemePreference('light'));assert.equal(theme.resolvedMode,'light');
 assert.equal(storage.get('vmeste:themePreference'),'light');
 await act(async()=>tree.unmount());trees=[];
 await render(React.createElement(ReadTheme));assert.equal(theme.resolvedMode,'light');
 await act(async()=>theme.setThemePreference('system'));assert.equal(theme.resolvedMode,'dark');
});

function luminance(hex){const channels=hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('core text and button pairs meet 4.5:1 contrast in both palettes',()=>{
 for(const colors of [lightColors,darkColors]){
  for(const background of ['surface','background'])for(const foreground of ['text','textSecondary','textMuted'])assert.ok(contrast(colors[foreground],colors[background])>=4.5,`${foreground}/${background} ${contrast(colors[foreground],colors[background])}`);
  assert.ok(contrast(colors.tabActive,colors.accentSoft)>=4.5);
  assert.ok(contrast(colors.onAccent,colors.accent)>=4.5);
  assert.ok(contrast('#FFFFFF',colors.badge)>=4.5);
 }
});
