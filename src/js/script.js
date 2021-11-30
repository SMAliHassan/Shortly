'use strict';

///////////////////////////// INITIALIZE AOS //////////////////////
// AOS.init();

/////////////////////////////////// Loading Screen //////////////////////////////////////

// ensure that the browser scrolls to the top of the page when the page is refreshed
history.scrollRestoration = 'manual';
window.addEventListener('beforeunload', function () {
  window.scrollTo(0, 0);
});

window.addEventListener('load', function () {
  document.querySelector('.screen-loader').remove();
  document.querySelector('body').classList.remove('disable-scroll');
});

//////////////////////////////////// Nav popup //////////////////////////////////////////
const btnNav = document.querySelector('.nav__hamburger');
const navMenu = document.querySelector('.nav__menu--mobile');

btnNav.addEventListener('click', function () {
  navMenu.classList.toggle('nav__menu--mobile--hidden');
});

// ///////////////////////////////////// slide in animation///////////////////////////////

// const addSlideInAnim = function (parentEl, childElements) {
//   childElements.map(childEl => {
//     const child = document
//       .querySelector(`.${parentEl}`)
//       .querySelector(`.${childEl}`);

//     // adding the slide out class
//     child.classList.add('slide-out');

//     // adding transition
//     child.style.transition = 'transform 1s';
//   });
// };

// // Adding the animation on the statistics section elements
// addSlideInAnim('section-statistics', [
//   'm-heading',
//   'text-sub',
//   'section-statistics__bar',
//   'section-statistics__card-1',
//   'section-statistics__card-2',
//   'section-statistics__card-3',
// ]);

// // Adding the animation on the boost section elements
// addSlideInAnim('section-boost', ['m-heading', 'btn--primary']);

// const displayElement = function ([entry], observer) {
//   if (entry.isIntersecting) entry.target.classList.remove('slide-out');

//   if (!entry.target.classList.contains('slide-out'))
//     observer.unobserve(entry.target);
// };

// const elementObserver = new IntersectionObserver(displayElement, {
//   root: null,
//   threshold: 0.1,
// });

// const slideInElements = document.querySelectorAll('.slide-out');
// slideInElements.forEach(el => {
//   // Adding the observer on the element
//   elementObserver.observe(el);
// });

//////////////////////////////////// SHORTENING THE LINK ////////////////////////////////////
const API_URL = 'https://api.shrtco.de/v2/';
const linkForm = document.querySelector('.link-form');
const shortLinksSection = document.querySelector('.short-links');

const shortenLink = async function (url) {
  try {
    const res = await fetch(`${API_URL}shorten?url=${url}`);

    if (!res.ok) throw new Error();

    const { result } = await res.json();

    const shortLink = result.short_link;

    // Adding it to local storage
    setLocalStorage(url, shortLink);

    return shortLink;
  } catch (err) {
    throw err;
  }
};

const renderShortLink = function (originalUrl, shortUrl) {
  const markup = `
       <article class="short-links__link">
          <span class="short-links__link__original-url"
            >${originalUrl}</span
          >
          <div>
            <span class="short-links__link__short-url">${shortUrl}</span>
            <button class="short-links__link__copy-button">
              Copy
            </button>
            <button class="short-links__link__del-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </article>
  `;

  shortLinksSection
    .querySelector('.container')
    .insertAdjacentHTML('afterbegin', markup);
};

const renderLoader = function (parentEl) {
  const markup = `
  <div class="box">
  <div class="box__container">
    <span class="circle"></span>
    <span class="circle"></span>
    <span class="circle"></span>
    <span class="circle"></span>
  </div>
</div>`;
  parentEl.insertAdjacentHTML('afterbegin', markup);
};

const removeLoader = function (parentEl) {
  document.querySelector(`.${parentEl}`).querySelector('.box').remove();
};

//////////////////////// Adding the COPY BUTTON functionality ////////////////////////
shortLinksSection.addEventListener('click', function (e) {
  const btn = e.target;

  if (!btn.classList.contains('short-links__link__copy-button')) return;

  const shortLink = btn
    .closest('.short-links__link')
    .querySelector('.short-links__link__short-url').textContent;

  navigator.clipboard.writeText(shortLink);

  btn.textContent = 'Copied!';
  btn.classList.add('short-links__link__copy-button--clicked');
});

//////////////////////// Adding the Cross BUTTON functionality ////////////////////////
shortLinksSection.addEventListener('click', function (e) {
  const btn = e.target.closest('.short-links__link__del-button');

  if (!btn) return;

  const linkEl = btn.closest('.short-links__link');

  // Removing the link from the local storage
  deleteLocalStorage(
    linkEl.querySelector('.short-links__link__short-url').textContent
  );

  // Removing the link from the DOM
  linkEl.remove();
});

////////////////////////////////////// LOCAL STORAGE /////////////////////////////////
const setLocalStorage = function (originalUrl, shortUrl) {
  // Getting the data from the local storage
  const data = getLocalStorage();

  // Making the the Url object
  const url = {
    originalUrl,
    shortUrl,
  };

  // Adding the new object into the local storage array
  data.push(url);

  window.localStorage.setItem('URLs', JSON.stringify(data));
};

const getLocalStorage = function () {
  const data = window.localStorage.getItem('URLs');

  if (!data) return [];

  return JSON.parse(data);
};

const deleteLocalStorage = function (shortUrl) {
  const data = getLocalStorage();

  // Finding the index of the required object from the array
  const index = data.findIndex(urlObj => {
    console.log(urlObj);
    return urlObj.shortUrl === shortUrl;
  });

  // Removing the required object from the data array
  data.splice(index, 1);

  // Removing the "URLs" from the local storage
  window.localStorage.removeItem('URLs');

  // Adding another "URLs" from which the required object has been removed
  window.localStorage.setItem('URLs', JSON.stringify(data));
};

const init = function () {
  //////////////////////////////// Render the urls from local storage //////////////////////////
  getLocalStorage().forEach(urlObject => {
    renderShortLink(urlObject.originalUrl, urlObject.shortUrl);
  });

  //////////////////////////////// Add even listener on the link-form //////////////////////////
  linkForm.addEventListener('submit', async function (e) {
    try {
      e.preventDefault();

      if (document.querySelector('.link-form__error-message')) {
        document.querySelector('.link-form__error-message').remove();
      }

      // Getting the link from the link-form input
      const link = linkForm.querySelector('.link-form__input').value;
      console.log(link);

      // Clear the link from input
      linkForm.querySelector('.link-form__input').value = '';

      // Rendering the loader
      renderLoader(shortLinksSection.querySelector('.container'));

      // Getting the short URL from the API
      const shortUrl = await shortenLink(link);

      // Removing the loader
      removeLoader('short-links');

      // Rendering the short link
      renderShortLink(link, shortUrl);
    } catch (err) {
      removeLoader('short-links');

      linkForm.insertAdjacentHTML(
        'beforeend',
        '<p class="link-form__error-message">Please enter a valid URL!</p>'
      );
      console.log(err);
    }
  });
};
init();

///////////////////////////////// Reset the local storage ///////////////////////////////
const reset = function () {
  window.localStorage.clear();
};
