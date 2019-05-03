# AutomateCookieMonster
Are you tired of constantly clicking on the big cookie? Are you tired of purchasing the recommended building/upgrade one after the other? Do you want to click every golden cookie without needing to keep waiting in front of your browser?

You have come to the right place.

**Note:** This script requires the [Cookie Monster](https://github.com/Aktanusa/CookieMonster/) script.

## Functionalities

- Clicking the big cookie (50 times per second by default).
- Clicking the Wrinklers if any (5 times per second by default).
- Clicking the golden cookies.
- Automatic buying of the upgrades/cookies recommended by the Cookie Monster script.

## Usage
**Note:** Make sure you have enabled [Cookie Monster](https://github.com/Aktanusa/CookieMonster/) before loading this script.

### Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate, click the bookmark when the game's open.

```javascript
javascript: (function () {
	Game.LoadMod('https://tuxitop.github.io/AutomateCookieMonster/autoCM.js');
}());
```

### Userscript

If you'd rather use the add-on as a script via per example *Greasemonkey* or *Tampermonkey*, you can use the following script, which will automatically load *Cookie Monster* every time the original game loads. For more information, refer to your browser/plugin's documentation.

```javascript
// ==UserScript==
// @name Automate Cookie Monster
// @author Ali Mousavi
// @namespace tuxitop
// @include http://orteil.dashnet.org/cookieclicker/
// @include https://orteil.dashnet.org/cookieclicker/
// @version 1
// @homepage https://github.com/tuxitop/AutomateCookieMonster
// @grant none
// ==/UserScript==

var code = "(" + (function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://tuxitop.github.io/AutomateCookieMonster/autoCM.js');
            clearInterval(checkReady);
        }
    }, 1000);
}).toString() + ")()";

window.eval(code);
```

## Configuration

There are various options that  could be changed while the game is running via the browser console (`ctrl + shift + k`).

for example to have slower rate of building/upgrade purchases enter `ACM.Config.autoBuyRate = 50` in the browser console.

#### `ACM.Config.baseRate`

default: 20

base timeout of the main interval function. a value of 20 means the main function gets executed each 20 milliseconds (50 times per second). higher values will probably correspond to lower CPU usage and better performance.

#### `ACM.Config.autoClick`

default: 1

a value of `1` will enable auto clicking the big cookie. `0` will disable it.

#### `ACM.Config.autoClickRate`

default: 1

the timeout of `autoClick` function, relative to the `ACM.Config.baseTimeout`.

#### `ACM.Config.wrinklerClick`

default: 1

a value of `1` will enable clicking wrinklers. `0` will disable it.

#### `ACM.Config.wrinklerClickRate`

default: 10

the timeout of `wrinklerClick` function, relative to the `ACM.Config.baseTimeout`.

#### `ACM.Config.clickGolden`

default: 1

a value of `1` will enable clicking golden cookies. `0` will disable it.

#### `ACM.Config.clickWrath`

default: 0

a value of `1` will enable clicking wrath cookies. `0` will disable it.

#### `ACM.Config.dismissWrath`

default: 1

a value of `1` will stop the timer of wrath cookies. `0` will leave it be.

#### `  ACM.Config.clickGoldenRate`

default: 25

the timeout of `clickGolden`/`clickWrath`/`dismissWrath` functions, relative to the `ACM.Config.baseTimeout`.

#### `ACM.Config.autoBuy`

default: 1

a value of `1` will enable automatic purchase of building/upgrades. `0` will disable it.

#### `ACM.Config.autoBuyRate`

the timeout of `autoBuy` function, relative to the `ACM.Config.baseTimeout`.

#### `ACM.Config.autoBuyUpgrades`

default: 1

a value of `1` will enable automatic purchase of upgrades. `0` will disable it.

#### `ACM.Config.autoBuyConsiderLucky`

default: 0

a value of 1 will cause the purchases of upgrades to be done only when the number of available cookies are above the the required cookies for getting maximum Lucky Cookies.

#### `ACM.Config.autoBuyConsiderFrenzy`

default: 0