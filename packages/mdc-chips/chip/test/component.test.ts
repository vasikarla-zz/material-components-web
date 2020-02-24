/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCRipple} from '../../../mdc-ripple/index';
import {emitEvent} from '../../../../testing/dom/events';
import {createMockFoundation} from '../../../../testing/helpers/foundation';
import {chipCssClasses, chipStrings, MDCChip, MDCChipFoundation} from '../index';

const {CHECKMARK_SELECTOR} = MDCChipFoundation.strings;

const getFixture = () => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
  <div class="mdc-chip" role="row">
    <span role="gridcell">
      <span role="button" tabindex="0" class="mdc-chip__primary-action">
        <span class="mdc-chip__text">Chip content</span>
      </span>
    </span>
  </div>`;

  const el = wrapper.firstElementChild as HTMLElement;
  wrapper.removeChild(el);
  return el;
};

const getFixtureWithCheckmark = () => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
  <div class="mdc-chip">
    <div class="mdc-chip__checkmark" >
      <svg class="mdc-chip__checkmark-svg" viewBox="-2 -3 30 30">
        <path class="mdc-chip__checkmark-path" fill="none" stroke="black"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
      </svg>
    </div>
    <span role="gridcell">
      <span role="checkbox" aria-checked="false" tabindex="0" class="mdc-chip__primary-action">
        <span class="mdc-chip__text">Chip content</span>
      </span>
    </span>
  </div>`;

  const el = wrapper.firstElementChild as HTMLElement;
  wrapper.removeChild(el);
  return el;
};

const addLeadingIcon = (root: HTMLElement) => {
  const wrapper = document.createElement('div');

  wrapper.innerHTML =
      `<i class="material-icons mdc-chip__icon mdc-chip__icon--leading">face</i>`;
  const icon = wrapper.firstElementChild as HTMLElement;
  wrapper.removeChild(icon);

  root.insertBefore(icon, root.firstChild);
  return icon;
};

const addTrailingIcon = (root: HTMLElement) => {
  const wrapper = document.createElement('div');

  wrapper.innerHTML = `<span role="gridcell"></span>`;
  const parent = wrapper.firstElementChild as HTMLElement;
  wrapper.removeChild(parent);

  wrapper.innerHTML = `
    <i tabindex="0" role="button" class="material-icons mdc-chip__icon mdc-chip__icon--trailing">cancel</i>
  `;
  const icon = wrapper.firstElementChild as HTMLElement;
  wrapper.removeChild(icon);

  parent.appendChild(icon);
  root.appendChild(parent);
  return icon;
};

const addTrailingAction = (root: HTMLElement) => {
  const icon = addTrailingIcon(root);
  icon.classList.add(chipCssClasses.TRAILING_ACTION);
  return icon;
};

class FakeRipple {
  destroy: jasmine.Spy;

  constructor(readonly root: HTMLElement|null) {
    this.destroy = jasmine.createSpy('.destroy');
  }
}

function setupTest() {
  const root = getFixture();
  const component = new MDCChip(root);
  return {root, component};
}

function setupMockRippleTest() {
  const root = getFixture();
  const component = new MDCChip(root, undefined, () => new FakeRipple(null));
  return {root, component};
}

function setupMockFoundationTest(root = getFixture()) {
  const mockFoundation = createMockFoundation(MDCChipFoundation);
  const component = new MDCChip(root, mockFoundation);
  return {root, component, mockFoundation};
}

describe('MDCChip', () => {
  it('attachTo returns an MDCChip instance', () => {
    expect(MDCChip.attachTo(getFixture()) instanceof MDCChip).toBe(true);
  });

  it('#initialSyncWithDOM sets up event handlers', () => {
    const {root, mockFoundation} = setupMockFoundationTest();

    emitEvent(root, 'click');
    expect(mockFoundation.handleInteraction)
        .toHaveBeenCalledWith(jasmine.anything());
    expect(mockFoundation.handleInteraction).toHaveBeenCalledTimes(1);

    emitEvent(root, 'transitionend');
    expect(mockFoundation.handleTransitionEnd)
        .toHaveBeenCalledWith(jasmine.anything());
    expect(mockFoundation.handleTransitionEnd).toHaveBeenCalledTimes(1);

    emitEvent(root, 'keydown');
    expect(mockFoundation.handleKeydown)
        .toHaveBeenCalledWith(jasmine.anything());
    expect(mockFoundation.handleKeydown).toHaveBeenCalledTimes(1);
  });

  it('#initialSyncWithDOM sets up interaction event handler on trailing icon if present',
     () => {
       const root = getFixture();
       const icon = addTrailingIcon(root);
       const {mockFoundation} = setupMockFoundationTest(root);

       emitEvent(icon, 'click');
       expect(mockFoundation.handleTrailingIconInteraction)
           .toHaveBeenCalledWith(jasmine.anything());
       expect(mockFoundation.handleTrailingIconInteraction)
           .toHaveBeenCalledTimes(1);
     });

  it('#destroy removes event handlers', () => {
    const {root, component, mockFoundation} = setupMockFoundationTest();
    component.destroy();

    emitEvent(root, 'click');
    expect(mockFoundation.handleInteraction)
        .not.toHaveBeenCalledWith(jasmine.anything());

    emitEvent(root, 'transitionend');
    expect(mockFoundation.handleTransitionEnd)
        .not.toHaveBeenCalledWith(jasmine.anything());

    emitEvent(root, 'keydown');
    expect(mockFoundation.handleKeydown)
        .not.toHaveBeenCalledWith(jasmine.anything());
  });

  it('#destroy removes interaction event handler on trailing icon if present',
     () => {
       const root = getFixture();
       const icon = addTrailingIcon(root);
       const {component, mockFoundation} = setupMockFoundationTest(root);

       component.destroy();
       emitEvent(icon, 'click');
       expect(mockFoundation.handleTrailingIconInteraction)
           .not.toHaveBeenCalledWith(jasmine.anything());
     });

  it('#destroy destroys ripple', () => {
    const {component} = setupMockRippleTest();
    component.destroy();
    expect(component.ripple.destroy).toHaveBeenCalled();
  });

  it('get ripple returns MDCRipple instance', () => {
    const {component} = setupTest();
    expect(component.ripple instanceof MDCRipple).toBe(true);
  });

  it('sets id on chip if attribute exists', () => {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
    <div class="mdc-chip" id="hello-chip">
      <div class="mdc-chip__text">Hello</div>
    </div>
  `;
    const root = wrapper.firstElementChild as HTMLElement;
    wrapper.removeChild(root);

    const component = new MDCChip(root);
    expect(component.id).toEqual('hello-chip');
  });

  it('adapter#hasClass returns true if class is set on chip set element',
     () => {
       const {root, component} = setupTest();
       root.classList.add('foo');
       expect(
           (component.getDefaultFoundation() as any).adapter_.hasClass('foo'))
           .toBe(true);
     });

  it('adapter#addClass adds a class to the root element', () => {
    const {root, component} = setupTest();
    (component.getDefaultFoundation() as any).adapter_.addClass('foo');
    expect(root.classList.contains('foo')).toBe(true);
  });

  it('adapter#removeClass removes a class from the root element', () => {
    const {root, component} = setupTest();
    root.classList.add('foo');
    (component.getDefaultFoundation() as any).adapter_.removeClass('foo');
    expect(root.classList.contains('foo')).toBe(false);
  });

  it('adapter#addClassToLeadingIcon adds a class to the leading icon element',
     () => {
       const root = getFixtureWithCheckmark();
       const leadingIcon = addLeadingIcon(root);
       const component = new MDCChip(root);

       (component.getDefaultFoundation() as any)
           .adapter_.addClassToLeadingIcon('foo');
       expect(leadingIcon.classList.contains('foo')).toBe(true);
     });

  it('adapter#addClassToLeadingIcon does nothing if no leading icon element is present',
     () => {
       const {component} = setupTest();
       expect(
           () => (component.getDefaultFoundation() as any)
                     .adapter_.addClassToLeadingIcon)
           .not.toThrow();
     });

  it('adapter#removeClassFromLeadingIcon removes a class from the leading icon element',
     () => {
       const root = getFixtureWithCheckmark();
       const leadingIcon = addLeadingIcon(root);
       const component = new MDCChip(root);

       leadingIcon.classList.add('foo');
       (component.getDefaultFoundation() as any)
           .adapter_.removeClassFromLeadingIcon('foo');
       expect(leadingIcon.classList.contains('foo')).toBe(false);
     });

  it('adapter#removeClassFromLeadingIcon does nothing if no leading icon element is present',
     () => {
       const {component} = setupTest();
       expect(
           () => (component.getDefaultFoundation() as any)
                     .adapter_.removeClassFromLeadingIcon)
           .not.toThrow();
     });

  it('adapter#eventTargetHasClass returns true if given element has class',
     () => {
       const {component} = setupTest();

       const wrapper = document.createElement('div');

       wrapper.innerHTML = `<div class="foo">bar</div>`;
       const mockEventTarget = wrapper.firstElementChild as HTMLElement;
       wrapper.removeChild(mockEventTarget);

       expect((component.getDefaultFoundation() as any)
                  .adapter_.eventTargetHasClass(mockEventTarget, 'foo'))
           .toBe(true);
     });

  it('adapter#notifyInteraction emits ' +
         MDCChipFoundation.strings.INTERACTION_EVENT,
     () => {
       const {component} = setupTest();
       const handler = jasmine.createSpy('interaction handler');

       component.listen(MDCChipFoundation.strings.INTERACTION_EVENT, handler);
       (component.getDefaultFoundation() as any).adapter_.notifyInteraction();

       expect(handler).toHaveBeenCalledWith(jasmine.anything());
     });

  it('adapter#notifySelection emits ' +
         MDCChipFoundation.strings.SELECTION_EVENT,
     () => {
       const {component} = setupTest();
       const handler = jasmine.createSpy('selection handler');

       component.listen(MDCChipFoundation.strings.SELECTION_EVENT, handler);
       (component.getDefaultFoundation() as any).adapter_.notifySelection();

       expect(handler).toHaveBeenCalledWith(jasmine.anything());
     });

  it('adapter#notifyTrailingIconInteraction emits ' +
         MDCChipFoundation.strings.TRAILING_ICON_INTERACTION_EVENT,
     () => {
       const {component} = setupTest();
       const handler = jasmine.createSpy('interaction handler');

       component.listen(
           MDCChipFoundation.strings.TRAILING_ICON_INTERACTION_EVENT, handler);
       (component.getDefaultFoundation() as any)
           .adapter_.notifyTrailingIconInteraction();

       expect(handler).toHaveBeenCalledWith(jasmine.anything());
     });

  it('adapter#notifyRemoval emits ' + MDCChipFoundation.strings.REMOVAL_EVENT,
     () => {
       const {component} = setupTest();
       const handler = jasmine.createSpy('interaction handler');

       component.listen(MDCChipFoundation.strings.REMOVAL_EVENT, handler);
       (component.getDefaultFoundation() as any).adapter_.notifyRemoval();

       expect(handler).toHaveBeenCalledWith(jasmine.anything());
     });

  it('adapter#notifyNavigation emits ' +
         MDCChipFoundation.strings.NAVIGATION_EVENT,
     () => {
       const {component} = setupTest();
       const handler = jasmine.createSpy('interaction handler');

       component.listen(MDCChipFoundation.strings.NAVIGATION_EVENT, handler);
       (component.getDefaultFoundation() as any)
           .adapter_.notifyNavigation(MDCChipFoundation.strings.ARROW_LEFT_KEY);

       expect(handler).toHaveBeenCalledWith(jasmine.anything());
     });

  it('adapter#getComputedStyleValue returns property value from root element styles',
     () => {
       const {root, component} = setupTest();
       expect((component.getDefaultFoundation() as any)
                  .adapter_.getComputedStyleValue('color'))
           .toEqual(window.getComputedStyle(root).getPropertyValue('color'));
     });

  it('adapter#setStyleProperty sets a style property on the root element',
     () => {
       const {root, component} = setupTest();
       const color = 'blue';
       (component.getDefaultFoundation() as any)
           .adapter_.setStyleProperty('color', color);
       expect(root.style.getPropertyValue('color')).toEqual(color);
     });

  it('adapter#hasLeadingIcon returns true if the chip has a leading icon',
     () => {
       const root = getFixtureWithCheckmark();
       addLeadingIcon(root);
       const component = new MDCChip(root);

       expect(
           (component.getDefaultFoundation() as any).adapter_.hasLeadingIcon())
           .toBe(true);
     });

  it('adapter#hasLeadingIcon returns false if the chip does not have a leading icon',
     () => {
       const {component} = setupTest();
       expect(
           (component.getDefaultFoundation() as any).adapter_.hasLeadingIcon())
           .toBe(false);
     });

  it('adapter#getRootBoundingClientRect calls getBoundingClientRect on the root element',
     () => {
       const {root, component} = setupTest();
       root.getBoundingClientRect = jasmine.createSpy('');
       (component.getDefaultFoundation() as any)
           .adapter_.getRootBoundingClientRect();
       expect(root.getBoundingClientRect).toHaveBeenCalledTimes(1);
     });

  it('adapter#getCheckmarkBoundingClientRect calls getBoundingClientRect on the checkmark element if it exists',
     () => {
       const root = getFixtureWithCheckmark();
       const component = new MDCChip(root);
       const checkmark = root.querySelector(CHECKMARK_SELECTOR);

       checkmark!.getBoundingClientRect = jasmine.createSpy('');
       (component.getDefaultFoundation() as any)
           .adapter_.getCheckmarkBoundingClientRect();
       expect(checkmark!.getBoundingClientRect).toHaveBeenCalledTimes(1);
     });

  it('adapter#getCheckmarkBoundingClientRect returns null when there is no checkmark element',
     () => {
       const {component} = setupTest();
       expect((component.getDefaultFoundation() as any)
                  .adapter_.getCheckmarkBoundingClientRect())
           .toBe(null);
     });

  it('adapter#hasTrailingAction returns false when no trailing action is present',
     () => {
       const root = getFixture();
       addTrailingIcon(root);
       const component = new MDCChip(root);
       expect((component.getDefaultFoundation() as any)
                  .adapter_.hasTrailingAction())
           .toBe(false);
     });

  it('adapter#hasTrailingAction returns true when trailing icon is present',
     () => {
       const root = getFixture();
       addTrailingAction(root);
       const component = new MDCChip(root);
       expect((component.getDefaultFoundation() as any)
                  .adapter_.hasTrailingAction())
           .toBe(true);
     });

  it('adapter#isRTL returns false if the text direction is not RTL', () => {
    const {component, root} = setupTest();
    document.documentElement.appendChild(root);
    expect((component.getDefaultFoundation() as any).adapter_.isRTL())
        .toBe(false);
    document.documentElement.removeChild(root);
  });

  it('adapter#isRTL returns true if the text direction is RTL', () => {
    const {component, root} = setupTest();
    document.documentElement.appendChild(root);
    document.documentElement.setAttribute('dir', 'rtl');
    expect((component.getDefaultFoundation() as any).adapter_.isRTL())
        .toBe(true);
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeChild(root);
  });

  it('adapter#focusPrimaryAction gives focus to the primary action element',
     () => {
       const {component, root} = setupTest();
       document.documentElement.appendChild(root);
       (component.getDefaultFoundation() as any).adapter_.focusPrimaryAction();
       expect(document.activeElement)
           .toEqual(root.querySelector(chipStrings.PRIMARY_ACTION_SELECTOR));
       document.documentElement.removeChild(root);
     });

  it('adapter#focusTrailingAction gives focus to the trailing icon element',
     () => {
       const root = getFixture();
       const trailingAction = addTrailingAction(root);
       document.documentElement.appendChild(root);
       const component = new MDCChip(root);
       (component.getDefaultFoundation() as any).adapter_.focusTrailingAction();
       expect(document.activeElement).toEqual(trailingAction);
       document.documentElement.removeChild(root);
     });

  it('adapter#setPrimaryActionAttr sets the attribute on the text element',
     () => {
       const {root, component} = setupTest();
       const primaryAction =
           root.querySelector(chipStrings.PRIMARY_ACTION_SELECTOR);
       (component.getDefaultFoundation() as any)
           .adapter_.setPrimaryActionAttr('tabindex', '-1');
       expect(primaryAction!.getAttribute('tabindex')).toEqual('-1');
     });

  it('adapter#setTrailingActionAttr sets the attribute on the trailing action element',
     () => {
       const root = getFixture();
       const trailingAction = addTrailingAction(root);
       const component = new MDCChip(root);
       (component.getDefaultFoundation() as any)
           .adapter_.setTrailingActionAttr('tabindex', '-1');
       expect(trailingAction.getAttribute('tabindex')).toEqual('-1');
     });

  it('#get selected proxies to foundation', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    expect(component.selected).toEqual(mockFoundation.isSelected());
  });

  it('#set selected proxies to foundation', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.selected = true;
    expect(mockFoundation.setSelected).toHaveBeenCalledWith(true);
  });

  it('#get shouldRemoveOnTrailingIconClick proxies to foundation', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    expect(component.shouldRemoveOnTrailingIconClick)
        .toEqual(mockFoundation.getShouldRemoveOnTrailingIconClick());
  });

  it('#set shouldRemoveOnTrailingIconClick proxies to foundation', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.shouldRemoveOnTrailingIconClick = false;
    expect(mockFoundation.setShouldRemoveOnTrailingIconClick)
        .toHaveBeenCalledWith(false);
  });

  it('#setSelectedFromChipSet proxies to the same foundation method', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.setSelectedFromChipSet(true, false);
    expect(mockFoundation.setSelectedFromChipSet)
        .toHaveBeenCalledWith(true, false);
  });

  it('#beginExit proxies to foundation', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.beginExit();
    expect(mockFoundation.beginExit).toHaveBeenCalled();
  });

  it('#focusPrimaryAction proxies to the foundation#focusPrimaryAction', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.focusPrimaryAction();
    expect(mockFoundation.focusPrimaryAction).toHaveBeenCalled();
  });

  it('#focusTrailingAction proxies to the foundation#focusTrailingAction',
     () => {
       const {component, mockFoundation} = setupMockFoundationTest();
       component.focusTrailingAction();
       expect(mockFoundation.focusTrailingAction).toHaveBeenCalled();
     });

  it('#removeFocus proxies to the foundation#removeFocus', () => {
    const {component, mockFoundation} = setupMockFoundationTest();
    component.removeFocus();
    expect(mockFoundation.removeFocus).toHaveBeenCalled();
  });

  it('#remove removes the root from the DOM', () => {
    const {component, root} = setupTest();
    document.documentElement.appendChild(root);
    component.remove();
    expect(document.querySelector('.mdc-chip')).toEqual(null);
  });
});