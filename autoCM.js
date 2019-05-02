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
  autoBuyInterval: 1,
  autoBuyConsiderLucky: 1,
  autoBuyConsiderLuckyFrenzy: 0
};

ACM.State = {
  loaded: 0,
  frame: 0,
  bestUpgrade: null,
  bestBldg: null,
  nextPurchase: null
};

ACM.Start = function() {
  if (!ACM.State.loaded) {
    ACM.interval = setInterval(ACM.tick, ACM.Config.baseRate);
    ACM.State.loaded = 1;
  }
};

ACM.Stop = function() {
  if (ACM.State.loaded) {
    clearInterval(ACM.interval);
    ACM.State.loaded = 0;
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

Game.Automate.clickWrinlers = function() {
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