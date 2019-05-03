ACM = {
  Config: {},
  State: {},
  Automate: {},
  Utils: {},
};

/**
 * Configuration Notes:
 * --------------------
 * Rate of Refresh:
 *   baseRate is the timeout of the main interval function, all the other
 *   timeouts are considered relative to baseRate.
 *   eg. a baseRate of 10, and the autoBuyRate of 100, means the base interval
 *   will be 10ms and items will be purchased every 10*100 ms (1s).
 * 
 * autoBuyPools:
 *   Upgrades has five pools: ["", "cookie", "tech", "toggle", "debug", "prestige"]
 *   most of the upgrades are of "" or "cookie" pool. the ones in "tech" group
 *   are the technologies that are discovered using the Bingo Research Facility.
 * 
 * autoBuyConsider(Lucky/Frenzy):
 *   Enabling these would let the purchase to be made only when the available
 *   cookies are more than the required cookies for getting maximum Lucky
 *   cookies.
 */

ACM.Config = {
  baseRate: 20,
  autoClick: 1,
  autoClickRate: 1,
  wrinklerClick: 1,
  wrinklerClickRate: 10,
  clickGolden: 1,
  clickWrath: 0,
  dismissWrath: 1,
  clickGoldenRate: 25,
  autoBuy: 1,
  autoBuyRate: 10,
  autoBuyUpgrades: 1,
  autoBuyUpgradePools: ['', 'cookie'],
  autoBuyConsiderLucky: 0,
  autoBuyConsiderLuckyFrenzy: 0
};

ACM.State = {
  started: 0,
  frame: 0,
  bestUpgrade: null,
  bestBldg: null,
  nextPurchase: null
};

/**
 * Main Object
 */

ACM.Version = '2.019';
ACM.VersionMinor = '1';

ACM.Init = function() {
  let waitForCM = setInterval(function() {
    if (typeof CM !== 'undefined' && typeof CM.Disp !== 'undefined' && typeof CM.Disp.lastBuyBulk !== 'undefined') {
      let proceed = true;
      if (ACM.Version !== CM.VersionMajor) {
        proceed = confirm('Automate CM is made for version ' + ACM.Version + ' of Cookie Monster. Are you sure you want to continue with version ' + CM.VersionMajor + '?');
      }
      if (proceed) {
        ACM.Start();
      }
      clearInterval(waitForCM);
    }
  }, 500);
};

ACM.Start = function() {
  if (!ACM.State.started) {
    ACM.interval = setInterval(ACM.tick, ACM.Config.baseRate);
    ACM.State.started = 1;
    if (ACM.Version !== CM.VersionMajor) {
      console.warn('AutomateCM version (' + ACM.Version + ') does not math with the Coockie Monster version (' + CM.VersionMajor + ').');
    }
    Game.Notify('Automate Coockie Monster', 'Started the automation script.', '', 5, 1);
  }
};

ACM.Stop = function() {
  if (ACM.State.started) {
    clearInterval(ACM.interval);
    ACM.State.started = 0;
    Game.Notify('Automate Coockie Monster', 'Stopped the automation script.', '', 5, 1);
  }
};

ACM.tick = function() {
  ACM.State.frame = ACM.State.frame < 999 ? ACM.State.frame + 1 : 0;

  // Auto Click
  if (ACM.Config.autoClick) {
    if (!(ACM.State.frame % ACM.Config.autoClickRate)) {
      ACM.Automate.autoClick();
    }
  }

  // Auto Click Golden/Wrath Cookies
  if (ACM.Config.clickGolden || ACM.Config.clickWrath || ACM.Config.dismissWrath) {
    if (!(ACM.State.frame % ACM.Config.clickGoldenRate)) {
      ACM.Automate.clickGolden();
    }
  }

  // Auto Buy
  if (ACM.Config.autoBuy) {
    if (!(ACM.State.frame % ACM.Config.autoBuyRate)) {
      ACM.State.bestBldg = ACM.Utils.getBestBldg();
      if (ACM.Config.autoBuyUpgrades) {
        ACM.State.bestUpgrade = ACM.Utils.getBestUpgrade();
      }
      ACM.Automate.purchase();
    }
  }

  // Click Wrinklers
  if (ACM.Config.wrinklerClick) {
    if (!(ACM.State.frame % ACM.Config.wrinklerClickRate)) {
      ACM.Automate.clickWrinlers();
    }
  }
};

/**
 * Automation Functions
 */

ACM.Automate.autoClick = function() {
  Game.ClickCookie();
};

ACM.Automate.clickGolden = function() {
  Game.shimmers.forEach(function(shimmer) {
    switch(shimmer.wrath) {
      case 0:
        if (ACM.Config.clickGolden) {
          shimmer.pop();
        }
        break;
      case 1:
        if (ACM.Config.dismissWrath) {
          shimmer.life = 0;
        } else if (ACM.Config.clickWrath) {
          shimmer.pop();
        }
        break;
    }
  });
};

ACM.Automate.clickWrinlers = function() {
  Game.wrinklers.forEach(function(wrinkler) {
    if (wrinkler.close) {
      wrinkler.hp--;
    }
  });
};

ACM.Automate.purchase = function() {
  let nextUpg = ACM.State.bestUpgrade;
  let nextBldg = ACM.State.bestBldg;
  let purchase = nextUpg ? nextUpg : nextBldg;
  ACM.State.nextPurchase = purchase;
  let target = nextUpg ? 'Upgrades' : 'Objects';
  let price = nextUpg ? Game[target][purchase].basePrice : Game[target][purchase].price;
  let availableCookies = Game.cookies;
  
  if (ACM.Config.autoBuyConsiderLuckyFrenzy) {
    availableCookies -= CM.Cache.LuckyFrenzy;
  } else if (ACM.Config.autoBuyConsiderLucky) {
    availableCookies -= CM.Cache.Lucky;
  }

  if (availableCookies > price) {
    Game[target][purchase].buy();
  }
};

/**
 * Helpers
 */

ACM.Utils.getBestBldg = function () {
  for (let i in CM.Cache.Objects) { 
    if (CM.Cache.Objects[i].color === 'Green') { 
      return i; 
    }
  }
};

ACM.Utils.getBestUpgrade = function() {
  let upg = null;
  let pp = Number.POSITIVE_INFINITY;
  for (let i in CM.Cache.Upgrades) {
    let upgrade = Game.Upgrades[i];
    let isInPool = (ACM.Config.autoBuyUpgradePools.indexOf(upgrade.pool) > -1);
    if (CM.Cache.Upgrades[i].color === 'Blue' && isInPool && CM.Cache.Upgrades[i].pp < pp) {
      pp = CM.Cache.Upgrades[i].pp;
      upg = i;
    }
  }
  return upg;
};

ACM.Init();