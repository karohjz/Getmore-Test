// https://swiperjs.com/demos/

const swiper = new Swiper('.home-products-swiper', {
	slidesPerView: 1,
	loop: true,
	speed: 1000,

	autoplay: {
		delay: 5000,
		disableOnInteraction: true,
	},

	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},

	breakpoints: {
		576: { slidesPerView: 1 },
		768: { slidesPerView: 2 },
		992: { slidesPerView: 3 },
		1200: { slidesPerView: 3 },
	}
});
