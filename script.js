
(() => {
    const carousel = document.querySelector('#artist-carousel');
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.music-card'));
    const previousButton = document.querySelector('#prev-artist');
    const nextButton = document.querySelector('#next-artist');
    const currentIndex = document.querySelector('#current-index');
    const selectedName = document.querySelector('#selected-name');

    if (!carousel || !track || cards.length === 0) return;

    let activeIndex = Math.max(
        0,
        cards.findIndex(card => card.classList.contains('is-active'))
    );

    let scrollFrame = null;

    // แสดงตัวอักษรแทนเมื่อไม่พบไฟล์รูปภาพ
    cards.forEach(card => {
        const image = card.querySelector('img');
        if (!image) return;

        const showFallback = () => {
            if (card.querySelector('.image-fallback')) return;

            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.setAttribute('aria-hidden', 'true');

            const name =
                card.querySelector('h2')?.textContent ||
                image.alt ||
                'Artist';

            fallback.textContent = name
                .split(/\s+/)
                .map(word => word[0])
                .join('')
                .slice(0, 3)
                .toUpperCase();

            card.insertBefore(fallback, image);
            image.hidden = true;
        };

        image.addEventListener('error', showFallback);

        if (image.complete && image.naturalWidth === 0) {
            showFallback();
        }
    });

    function setActive(index, shouldScroll = true) {
        activeIndex = (index + cards.length) % cards.length;

        cards.forEach((card, i) => {
            const active = i === activeIndex;
            card.classList.toggle('is-active', active);
            card.setAttribute('aria-current', active ? 'true' : 'false');
        });

        if (currentIndex) {
            currentIndex.textContent = String(activeIndex + 1).padStart(2, '0');
        }

        if (selectedName) {
            selectedName.textContent =
                cards[activeIndex].querySelector('h2')?.textContent || 'Artist';
        }

        if (shouldScroll) {
            cards[activeIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // ปุ่มก่อนหน้าและถัดไป
    previousButton?.addEventListener('click', () => {
        setActive(activeIndex - 1);
    });

    nextButton?.addEventListener('click', () => {
        setActive(activeIndex + 1);
    });

    // คลิกการ์ดเพื่อเลือกศิลปิน หรือเปิดหน้าเพลง
cards.forEach((card, index) => {
    card.addEventListener('click', () => {
        setActive(index);

        const link = card.dataset.songLink?.trim();

        // เปิดเพลงเมื่อใส่ลิงก์แล้วเท่านั้น
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    });

    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            setActive(index);

            const link = card.dataset.songLink?.trim();

            if (link) {
                window.open(link, '_blank', 'noopener,noreferrer');
            }
        }
    });
});

    // อัปเดตศิลปินที่เลือกตามตำแหน่งเลื่อน
    carousel.addEventListener('scroll', () => {
        if (scrollFrame !== null) {
            cancelAnimationFrame(scrollFrame);
        }

        scrollFrame = requestAnimationFrame(() => {
            const viewport = carousel.getBoundingClientRect();
            const center = viewport.left + viewport.width / 2;

            let closestIndex = activeIndex;
            let closestDistance = Infinity;

            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(center - cardCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== activeIndex) {
                setActive(closestIndex, false);
            }
        });
    }, { passive: true });

    // ใช้ลูกศรบนคีย์บอร์ด
    carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setActive(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            setActive(activeIndex + 1);
        }
    });

    // เริ่มต้นที่ศิลปินที่เลือกไว้
    setActive(activeIndex, false);

    requestAnimationFrame(() => {
        cards[activeIndex].scrollIntoView({
            block: 'nearest',
            inline: 'center'
        });
    });
})();
