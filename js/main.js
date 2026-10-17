document.addEventListener("DOMContentLoaded", function () {
    initCardSlider();
    initCardOptions();
});

function initCardSlider() {
    const sliderBlock = document.querySelector('.card-block-slider');
    if (!sliderBlock) return;

    const sliderItems = sliderBlock.querySelectorAll(':scope > .card-block-slider-item');
    const images = Array.from(sliderItems).map(function (item) {
        const img = item.querySelector('img');
        return img ? img.src : '';
    }).filter(Boolean);

    if (!images.length) return;

    let sliderEl = sliderBlock.querySelector('.card-block-slider-inner');
    if (!sliderEl) {
        sliderEl = document.createElement('div');
        sliderEl.className = 'card-block-slider-inner';
        images.forEach(function (src) {
            const slide = document.createElement('div');
            slide.className = 'card-block-slider-item';
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'card-block-slider-image';
            slide.appendChild(img);
            sliderEl.appendChild(slide);
        });
        sliderItems.forEach(function (item) {
            item.remove();
        });
        sliderBlock.insertBefore(sliderEl, sliderBlock.firstChild);
    }

    let thumbsContainer = sliderBlock.querySelector('.card-block-slider-thumbnails');
    if (!thumbsContainer) {
        thumbsContainer = document.createElement('div');
        thumbsContainer.className = 'card-block-slider-thumbnails';
        sliderBlock.appendChild(thumbsContainer);
    }

    let thumbsInner = thumbsContainer.querySelector('.card-block-slider-thumbnails-inner');
    if (!thumbsInner) {
        thumbsInner = document.createElement('div');
        thumbsInner.className = 'card-block-slider-thumbnails-inner';

        const existingThumbs = thumbsContainer.querySelectorAll(':scope > .card-block-slider-thumbnails-item');
        if (existingThumbs.length) {
            existingThumbs.forEach(function (item) {
                thumbsInner.appendChild(item);
            });
        } else {
            images.forEach(function (src) {
                thumbsInner.appendChild(createThumb(src));
            });
        }

        thumbsContainer.appendChild(thumbsInner);
    }

    thumbsInner.querySelectorAll('.card-block-slider-thumbnails-item').forEach(function (item, index) {
        item.dataset.index = String(index);
    });

    const mainSlider = tns({
        container: sliderEl,
        items: 1,
        slideBy: 1,
        autoplay: false,
        controls: false,
        nav: false,
        arrowKeys: true,
        mouseDrag: true,
        loop: true,
        gutter: 0,
        autoplayButtonOutput: false,
        speed: 300
    });

    const thumbsCount = thumbsInner.children.length;
    const thumbsSlider = thumbsCount > 1 ? tns({
        container: thumbsInner,
        items: Math.min(thumbsCount, 6),
        slideBy: 1,
        autoplay: false,
        nav: false,
        controls: true,
        controlsText: ['‹', '›'],
        mouseDrag: true,
        loop: false,
        rewind: false,
        gutter: 8,
        autoplayButtonOutput: false,
        speed: 300,
        responsive: {
            0: { items: Math.min(thumbsCount, 4) },
            768: { items: Math.min(thumbsCount, 5) },
            1440: { items: Math.min(thumbsCount, 6) }
        }
    }) : null;

    function createThumb(src) {
        const thumb = document.createElement('div');
        thumb.className = 'card-block-slider-thumbnails-item';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'card-block-slider-thumbnails-image';
        thumb.appendChild(img);
        return thumb;
    }

    function updateThumbsOverflow() {
        if (!thumbsSlider) {
            thumbsContainer.classList.remove('has-overflow');
            return;
        }

        const info = thumbsSlider.getInfo();
        thumbsContainer.classList.toggle('has-overflow', info.slideCount > info.items);
    }

    function ensureThumbVisible(index) {
        if (!thumbsSlider) return;

        const info = thumbsSlider.getInfo();
        const firstVisible = info.index;
        const lastVisible = firstVisible + info.items - 1;

        if (index < firstVisible) {
            thumbsSlider.goTo(index);
        } else if (index > lastVisible) {
            thumbsSlider.goTo(index - info.items + 1);
        }
    }

    function setActiveThumb(index) {
        thumbsContainer.querySelectorAll('.card-block-slider-thumbnails-item').forEach(function (item) {
            item.classList.toggle('is-active', Number(item.dataset.index) === index);
        });
        ensureThumbVisible(index);
    }

    thumbsContainer.addEventListener('click', function (e) {
        const thumb = e.target.closest('.card-block-slider-thumbnails-item');
        if (!thumb) return;
        const index = Number(thumb.dataset.index);
        if (Number.isNaN(index)) return;
        mainSlider.goTo(index);
        setActiveThumb(index);
    });

    mainSlider.events.on('indexChanged', function (info) {
        setActiveThumb(info.displayIndex - 1);
    });

    setActiveThumb(0);
    updateThumbsOverflow();
    window.addEventListener('resize', updateThumbsOverflow);
}

function initCardOptions() {
    const cardBlock = document.querySelector('.card-block');
    if (!cardBlock) return;

    const optionItems = cardBlock.querySelectorAll('.card-block-options-list-item');
    if (!optionItems.length) return;

    const articleEl = cardBlock.querySelector('.card-block-article p');
    const oldPriceEl = cardBlock.querySelector('.card-block-prices-old-price');
    const newPriceEl = cardBlock.querySelector('.card-block-prices-new-price');

    function setPrice(container, value) {
        if (!container) return;

        const hasValue = Boolean(value);
        container.hidden = !hasValue;
        if (!hasValue) return;

        const p = container.querySelector('p');
        if (!p) return;

        const icon = p.querySelector('i');
        p.textContent = value + ' ';
        if (icon) {
            p.appendChild(icon);
        } else {
            const iconEl = document.createElement('i');
            iconEl.innerHTML = '&#8203;';
            p.appendChild(iconEl);
        }
    }

    function selectOption(item) {
        optionItems.forEach(function (el) {
            el.classList.toggle('is-active', el === item);
        });

        if (articleEl) {
            articleEl.textContent = item.dataset.article || '';
        }

        setPrice(oldPriceEl, item.dataset.price);
        setPrice(newPriceEl, item.dataset.newPrice);
    }

    optionItems.forEach(function (item) {
        item.addEventListener('click', function () {
            selectOption(item);
        });
    });

    selectOption(optionItems[0]);
}
