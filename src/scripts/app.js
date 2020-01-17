/* global document, window, Image */

const transitionDurationMs = 250;

function toArray(obj) {
  return Array.prototype.slice.call(obj);
}

function isVisibleInView(el) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;
  return elemTop < window.innerHeight && elemBottom >= 0;
}

function toggleOpacity(slideEl, before = 0, after = 100) {
  slideEl.classList.remove(`opacity-${before}`);
  slideEl.classList.add(`opacity-${after}`);
}

function startLoading(item) {
  const { src, el } = item;
  if (item.started) {
    return;
  }
  const image = new Image();
  toggleOpacity(el, 0, 100);
  image.onload = () => {
    toggleOpacity(el, 100, 0);
    setTimeout(() => {
      el.style.backgroundImage = `url(${src})`;
      el.style.backgroundSize = "contain";
      toggleOpacity(el, 0, 100);
    }, transitionDurationMs);
  };
  item.started = true;
  image.src = src;
}

function loadVisibleItems(elementsToLoad) {
  elementsToLoad.forEach(item => {
    if (!item.started && isVisibleInView(item.el)) {
      startLoading(item);
    }
  });
}

function initLazyLoader() {
  const itemsToLoad = toArray(
    document.getElementsByClassName("lazyload-image")
  ).map(el => ({ started: false, el, src: el.dataset.src, type: "image" }));
  window.addEventListener("scroll", () => loadVisibleItems(itemsToLoad));
  window.addEventListener("resize", () => loadVisibleItems(itemsToLoad));
  loadVisibleItems(itemsToLoad);
}

document.addEventListener("DOMContentLoaded", initLazyLoader);
