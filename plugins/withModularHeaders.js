const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// GoogleSignIn 8.x (via @react-native-google-signin v16) pulls in AppCheckCore,
// a Swift pod whose dependencies GoogleUtilities and RecaptchaInterop lack module
// maps. CocoaPods exits with code 1 unless they opt into modular headers.
module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      let podfile = fs.readFileSync(podfilePath, 'utf-8');

      const patch =
        "  pod 'GoogleUtilities', :modular_headers => true\n" +
        "  pod 'RecaptchaInterop', :modular_headers => true\n";

      if (!podfile.includes("pod 'GoogleUtilities'")) {
        podfile = podfile.replace('use_expo_modules!', patch + '  use_expo_modules!');
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
