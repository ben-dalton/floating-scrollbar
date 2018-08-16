import $ from 'jquery';

class FScroll {
  constructor(cont) {
    let inst = this;
    inst.cont = cont;
    // debugger;
    let scrollBody = cont.closest('.fl-scrolls-body');
    if (scrollBody && scrollBody.length) {
      inst.scrollBody = scrollBody;
    }
    inst.sbar = inst.initScroll();
    inst.visible = true;
    inst.updateAPI(); // recalculate floating scrolls and hide those of them whose containers are out of sight
    inst.syncSbar(inst.cont);
    inst.addEventHandlers();
  }

  initScroll() {
    let flscroll = document.createElement('div');
    flscroll.classList.add('fl-scrolls');
    let { cont } = this;
    let newDiv = document.createElement('div');
    newDiv.style.width = `${cont.scrollWidth}px`;
    flscroll.appendChild(newDiv);
    return cont.appendChild(flscroll);
  }

  addEventHandlers() {
    let inst = this;
    let eventHandlers = (inst.eventHandlers = [
      {
        $el: inst.scrollBody || $(window),
        handlers: {
          // Don't use `$.proxy()` since it makes impossible event unbinding individually per instance
          // (see the warning at http://api.jquery.com/unbind/)
          scroll() {
            inst.checkVisibility();
          },
          resize() {
            inst.updateAPI();
          },
        },
      },
      {
        $el: inst.sbar,
        handlers: {
          scroll({ target }) {
            inst.visible && inst.syncCont(target, true);
          },
        },
      },
      {
        $el: $(inst.cont),
        handlers: {
          scroll({ target }) {
            inst.syncSbar(target, true);
          },
          focusin() {
            setTimeout(inst.syncSbar.bind(inst, inst.cont), 0);
          },
          'update.fscroll'({ namespace }) {
            // Check event namespace to ensure that this is not an extraneous event in a bubbling phase
            if (namespace === 'fscroll') {
              inst.updateAPI();
            }
          },
          'destroy.fscroll'({ namespace }) {
            if (namespace === 'fscroll') {
              inst.destroyAPI();
            }
          },
        },
      },
    ]);
    eventHandlers.forEach(({ $el, handlers }) => $el.bind(handlers));
  }

  checkVisibility() {
    let inst = this;
    let mustHide = inst.sbar[0].scrollWidth <= inst.sbar[0].offsetWidth;
    if (!mustHide) {
      let contRect = inst.cont.getBoundingClientRect();
      let maxVisibleY = inst.scrollBody
        ? inst.scrollBody[0].getBoundingClientRect().bottom
        : window.innerHeight || document.documentElement.clientHeight;
      mustHide = contRect.bottom <= maxVisibleY || contRect.top > maxVisibleY;
    }
    if (inst.visible === mustHide) {
      inst.visible = !mustHide;
      // we cannot simply hide a floating scroll bar since its scrollLeft property will not update in that case
      inst.sbar.toggleClass('fl-scrolls-hidden');
    }
  }

  syncCont(sender, preventSyncSbar) {
    let inst = this;
    // Prevents next syncSbar function from changing scroll position
    if (inst.preventSyncCont === true) {
      inst.preventSyncCont = false;
      return;
    }
    inst.preventSyncSbar = !!preventSyncSbar;
    inst.cont.scrollLeft = sender.scrollLeft;
  }

  syncSbar(sender, preventSyncCont) {
    let inst = this;
    // Prevents next syncCont function from changing scroll position
    if (inst.preventSyncSbar === true) {
      inst.preventSyncSbar = false;
      return;
    }
    inst.preventSyncCont = !!preventSyncCont;
    inst.sbar[0].scrollLeft = sender.scrollLeft;
  }

  // Compute outer width of an element with margin
  outerWidth(el) {
    let width = el.offsetWidth;
    const style = getComputedStyle(el);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
  }

  // Recalculate scroll width and container boundaries
  updateAPI() {
    let inst = this;
    let { cont } = inst;
    inst.sbar.width = inst.outerWidth(cont);
    if (!inst.scrollBody) {
      inst.sbar.style.left = `${cont.getBoundingClientRect().left}px`;
    }
    inst.sbar.setAttribute('width', cont.scrollWidth);
    inst.checkVisibility(); // fixes issue #2
  }

  // Remove a scrollbar and all related event handlers
  destroyAPI() {
    this.eventHandlers.forEach(({ $el, handlers }) => $el.unbind(handlers));
    this.eventHandlers = null;
    this.sbar.remove();
  }
}

function floatingScroll(els, method = 'init') {
  if (method === 'init') {
    Array.prototype.forEach.call(els, (el, i) => new FScroll(el));
  } else if (FScroll.prototype.hasOwnProperty(`${method}API`)) {
    // TODO
    this.trigger(`${method}.fscroll`);
  }
  return this;
}

function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
ready(floatingScroll(document.querySelectorAll('body [data-fl-scrolls]')));
