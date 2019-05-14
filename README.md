# MCIGN

## Introduction
This app is used to control keyless ignitions running MCIGN fiwmare. All communications between the app and the ignition are encrypted, and a new keys can be generated (optionally with an expiration date and other restrictions) to allow other phones to control the ignition. A proximity mode automatically unlocks the motorcycle when the user approaches it.

## Usage
[![main screen](https://github.com/mcign/app/blob/master/docs/home.png)](https://github.com/mcign/app/blob/master/docs/home.png)
Before a keyless ignition can be controlled, a key needs to be generated and registered. To register a new key, make sure the ignition is powered on (ie. installed on a motorcycle with a good battery) and within range (~50 meters) and scan the QR code that came with your ignition by pressing the "Scan Keycode" button. After scanning the keycode, enter some basic information about your motorcycle (year, make, model) and a name for the key, and then press the "Save Bike" button. The app will now connect to the ignition and register your new key.

[![register a new key](https://github.com/mcign/app/blob/master/docs/small_reg_key.png)](https://github.com/mcign/app/blob/master/docs/reg_key.png)

Once your key has been registered, you will be able to lock and unlock the bike, configure proximity, and manage keys.

[![control a bike](https://github.com/mcign/app/blob/master/docs/small_ctrl_bike.png)](https://github.com/mcign/app/blob/master/docs/ctrl_bike.png)

To manage keys, press on the "Keys" button at the bottom of the screen. A list of registered keys will be shown, and individual keys can be deleted by swiping them to the left. To create a new key, press the "Create New Key" button.

[![manage keys](https://github.com/mcign/app/blob/master/docs/small_keys.png)](https://github.com/mcign/app/blob/master/docs/keys.png)

To create a new full key, enter a name and press the "Register Full Key" or "Register Limited Key" button. Limited keys are unable to create new keys or delete existing keys, and can be configured to expire at a certain time or to only work at certain time of the day (curfew). Key expiration and curfew are not yet implemented.

[![create new key](https://github.com/mcign/app/blob/master/docs/small_new_key.png)](https://github.com/mcign/app/blob/master/docs/new_key.png)

## Contributing
This project is in its early stages, and all contributions are greatly appreciated. The following areas currently need the most attention:

 * UI/UX design
 * iOS support

Please verify that your modifications pass tslint (run `tslint -p .` in the main directory) before submitting a pull request.

## Help
Please create a github issue for technical support, feature requests, or general questions.

## Installation

### Requirements
 * Ionic 4 - `npm install -g ionic`

### Installation

#### Android
To compile the app and install it on your device (requires adb), run `ionic cordova run android --device`

#### iOS
Not yet supported.

## Contact

## License
This project is licensed under GPLv3.
