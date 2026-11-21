# VMESTE Blue: сборка для симулятора — 05.11.2026

- В `codex/vmeste-blue` влита `origin/release/1.1` (`2d375f2`) без конфликтов.
- Исходный commit сборки: `5406266e1f0ce2dc21d7a6cb776fb315dd35babe`.
- `npm run test:blue`: 8/8.
- EAS profile: `simulator`; platform: iOS; status: **FINISHED**.
- Build ID: `0a04b601-33cb-4cdd-89e4-fc4edfb9e5a7`.
- Сборка: https://expo.dev/accounts/ruslan1710/projects/sng-community2/builds/0a04b601-33cb-4cdd-89e4-fc4edfb9e5a7
- Артефакт скачан и распакован: `/Users/rus/Desktop/VMESTE-Blue/build/Vmeste.app`.
- `Info.plist`: `CFBundleIdentifier=com.vmeste.group`, `CFBundleSupportedPlatforms=iPhoneSimulator`.
- Это внутренняя simulator-сборка. В App Store/TestFlight ничего не отправлялось; remote build number не увеличивался (метаданные EAS показывают 21).

## Установка и скриншоты пока не подтверждены

`eas build:run --platform ios --id 0a04b601-33cb-4cdd-89e4-fc4edfb9e5a7 --simulator 'iPhone 18 Pro'` скачал архив, но завершился ошибкой определения Simulator.app. В установленном Xcode приложение находится как DeviceHub.app, а привычный путь Contents/Developer/Applications/Simulator.app отсутствует.

Прямой `simctl install booted` тоже не выполнился: CoreSimulatorService connection invalid / Connection refused из среды команд Codex. Разрешение записи в каталоги CoreSimulator не устранило ограничение. После ручной разблокировки Mac Device Hub виден в списке приложений, но попытки управления его окном завершились таймаутом.

На Рабочем столе подготовлены `Запустить.command` (установка уже скачанного приложения и запуск) и `Снять-экран.command` (сохранение текущего экрана в `screenshots`). Их синтаксис проверен, выполнение пользователем ещё не подтверждено. Никакие пароли в файлах не сохранены.

Пользователю предложено установить приложение и войти тестовым аккаунтом самостоятельно. iPad не создан; скриншотов ещё нет. Матрица требуемых экранов остаётся в `docs/vmeste-blue-review.md`.
