// 🍹 DOM Elements
const main = document.querySelector("main") as HTMLElement;
const header = document.querySelector("header") as HTMLElement;
const cart_button = document.querySelector(".cart_button") as HTMLElement;
const drink = document.querySelector(".drink") as HTMLElement;
const slider = document.querySelector(".slider") as HTMLElement;
const three_lines = document.querySelector(".three-lines") as HTMLElement;
const loader = document.querySelector(".loader") as HTMLElement;

const left_button = document.querySelector(".arrow-left") as HTMLElement;
const right_button = document.querySelector(".arrow-right") as HTMLElement;

const menu_link = document.querySelector(".menu_link") as HTMLElement;
const links = document.querySelectorAll(".link") as NodeListOf<HTMLElement>;

const bars = document.querySelector(".fa-bars") as HTMLElement;
const cross = document.querySelector(".fa-xmark") as HTMLElement;

const burger_menu = document.querySelector(".burger-menu") as HTMLElement;
const burger_menu_links = document.querySelectorAll(
	".burger_menu_link"
) as NodeListOf<HTMLElement>;

// const content = document.querySelector(".content") as HTMLElement;

const button = document.querySelector(".home button") as HTMLButtonElement;

const add_cart = document.querySelector(".add_cart") as HTMLElement;
const close = document.querySelector(".close") as HTMLElement;
const backdrop = document.querySelector(".backdrop") as HTMLElement;
const modal = document.querySelector(".modal") as HTMLElement;

const modal_photo = document.querySelector(".modal_photo") as HTMLImageElement;
const modal_name = document.querySelector(".modal .name") as HTMLElement;
const modal_description = document.querySelector(
	".modal .description"
) as HTMLElement;

// Modal size selectors
const S = document.querySelector(".modal .size_s") as HTMLElement;
const M = document.querySelector(".modal .size_m") as HTMLElement;
const L = document.querySelector(".modal .size_l") as HTMLElement;

// Modal size buttons
const button_S = document.querySelector(".modal .small") as HTMLButtonElement;
const button_M = document.querySelector(".modal .medium") as HTMLButtonElement;
const button_L = document.querySelector(".modal .large") as HTMLButtonElement;

const sizes_block = document.querySelector(".sizes_block") as HTMLElement;

// Additives selectors
const first_additive = document.querySelector(
	".modal .first_additive"
) as HTMLElement;
const second_additive = document.querySelector(
	".modal .second_additive"
) as HTMLElement;
const third_additive = document.querySelector(
	".modal .third_additive"
) as HTMLElement;

// Additives buttons
const button_first_additive = document.querySelector(
	".modal .first"
) as HTMLButtonElement;
const button_second_additive = document.querySelector(
	".modal .second"
) as HTMLButtonElement;
const button_third_additive = document.querySelector(
	".modal .third"
) as HTMLButtonElement;

const additives_block = document.querySelector(
	".additives_block"
) as HTMLElement;

// Other modal elements
const total_price = document.querySelector(
	".modal .total_price"
) as HTMLElement;

// 🥤 Media Sources (arrays of image URLs)
// const coffee_src: string[] = [];
// const tea_src: string[] = [];
// const dessert_src: string[] = [];
const productImages: ProductImages = {
	coffee: [],
	tea: [],
	dessert: [],
};
const drinks: string[] = [];
const drinks_names: string[] = [];
const drinks_info: string[] = [];
const drink_prices: string[] = [];

// ⚙️ State and Data Variables
let current: number = 0; // current index for slideshow
let startX: number = 0; // touch start X coordinate
let endX: number = 0; // touch end X coordinate
let count: number = 0;

let data: Product[] = []; // fetched product data (type `any` for now)
let fullData: Product[] = [];
let filteredData: Product[] = [];
let dataFavorites: Product[] = [];
let product: Product | null;
let blocks: HTMLElement[] = []; // some collection of blocks in UI (usage not shown here)

let productsExpanded: boolean = false;
let isTransitioning: boolean = false;
let isOpen: boolean = false;
let imageName: string; // fot github pages to work I need to do like I did with pop()

// 🛒 Current Product Info
interface CurrentProduct {
	adds: number[];
	size: keyof (typeof data)[0]["sizes"];
	index: number;
	id: string;
	type: string;
}

const current_product: CurrentProduct = {
	adds: [],
	size: "s",
	index: 0,
	id: "1",
	type: "coffee",
};

// 🔁 Constants & Timer Variables
const INTERVAL: number = 3000;
const lines: string[] = [".first_line", ".second_line", ".third_line"];

let timer: number | null = null;
let startedAt: number = 0;
let remaining: number = INTERVAL;

// Utility function to check if we are on the home page (based on main's class)
const isHome = (): boolean => main.classList.contains("home");

// Backup of the original main children nodes (to reset DOM if needed)
const backup: ChildNode[] = Array.from(main.childNodes);

// Types
type SizeKey = "s" | "m" | "l" | "xl" | "xxl";

type Size = {
	size: string;
	price: string;
	discountPrice: string;
};

type Additive = {
	name: string;
	price: string;
	discountPrice: string;
};

type Product = {
	id: number;
	name: string;
	description: string;
	price: string;
	discountPrice: string;
	category: string;
	sizes: Record<SizeKey, Size>;
	additives: Additive[]; // do i need to change here
};

type ProductImages = {
	coffee: string[];
	tea: string[];
	dessert: string[];
};

type Products = {
	id: number;
	name: string;
	description: string;
	price: string;
	discountPrice: string;
	category: "coffee" | "tea" | "dessert";
};

// API REQUESTS

async function getFavorites(): Promise<void> {
	try {
		loader.style.display = "block";
		slider.style.display = "none";
		three_lines.style.display = "none";
		const response = await fetch(
			"https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products/favorites"
		);
		if (!response.ok) {
			loader.textContent = "Something went wrong. Please, refresh the page";
			throw new Error("Network response was not ok");
		}
		const result = await response.json();
		dataFavorites = result.data;
		loader.style.display = "none";
		slider.style.display = "flex";
		three_lines.style.display = "flex";
		drinks.push(
			...dataFavorites.map((product) => `images/slider_${product.id}.png`)
		);
		drinks_names.push(...dataFavorites.map((p) => p.name));
		drinks_info.push(...dataFavorites.map((p) => p.description));
		drink_prices.push(...dataFavorites.map((p) => `$${p.price}`));
		render();
	} catch (error) {
		console.log("Error fetching data:", error);
	}
}

async function getProducts(): Promise<boolean> {
	const loader = document.createElement("div");
	loader.className = "second-loader";
	loader.textContent = "Loading...";
	main.appendChild(loader);
	console.log("[getProducts] Starting fetch");
	try {
		const response = await fetch(
			"https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products"
		);
		console.log("[getProducts] Response received", response);
		if (!response.ok) {
			console.log("[getProducts] Response NOT OK");
			throw new Error("Network response was no ok");
		}
		const result = await response.json();
		console.log("[getProducts] Data received", result);
		fullData = result.data;
		data = result.data;
		const products: Products[] = result.data;

		for (const product of products) {
			const ext = product.category === "coffee" ? "jpg" : "png";
			const imagePath = `images/${product.id}.${ext}`;

			if (product.category in productImages) {
				productImages[product.category].push(imagePath);
			}
		}
		// console.log(productImages);

		return true;
	} catch (error) {
		console.log("[getProducts] Catch block hit:", error);
		main.classList.remove("home");
		main.classList.add("menu");

		main.innerHTML = "";

		const h1 = document.createElement("h1");
		h1.innerHTML = `Behind each of our cups <br />
	              hides an <span>amazing surprise</span>`;

		const errorDiv = document.createElement("div");
		errorDiv.className = "fetch-error";
		errorDiv.textContent = "Something went wrong. Please, refresh the page";

		main.appendChild(h1);
		main.appendChild(errorDiv);
		console.log("Error fetching data:", error);
		return false;
	} finally {
		console.log("[getProducts] Finally block");
		if (main.contains(loader)) {
			main.removeChild(loader);
		}
	}
}

async function getProduct(id: string): Promise<Product | null> {
	const loader = document.createElement("div");
	loader.textContent = "Loading...";
	loader.style.fontSize = "100px";
	backdrop.appendChild(loader);
	try {
		const response = await fetch(
			`https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products/${id}`
		);
		if (!response.ok) {
			throw new Error("Network response was no ok");
		}
		const result = await response.json();
		backdrop.removeChild(loader);
		return result.data;
	} catch (error) {
		backdrop.removeChild(loader);
		backdrop.style.display = "none";
		console.log("Error fetching data:", error);
		alert("Something went wrong. Please, try again");
		return null;
	}
}

function createImage(): void {
	const img = document.createElement("img");
	img.src = drinks[current] as string;
	img.alt = `coffee-slider-${current}`;
	img.oncontextmenu = (e: MouseEvent) => {
		e.preventDefault();
		return false;
	};
	img.draggable = false;
	drink.appendChild(img);
}

function createDrinkName(): void {
	const drink_name = document.createElement("h3");
	drink_name.textContent = drinks_names[current] as string;
	drink_name.className = "drink-name";
	drink.appendChild(drink_name);
}

function createDrinkInfo(): void {
	const drink_info = document.createElement("p");
	drink_info.textContent = drinks_info[current] as string;
	drink_info.className = "drink-info";
	drink.appendChild(drink_info);
}

function createDrinkPrice(): void {
	const drink_price = document.createElement("p");
	drink_price.textContent = drink_prices[current] as string;
	drink_price.className = "price";
	drink.appendChild(drink_price);
}

function changeActive(): void {
	if (lines.length < 3) return;
	lines.forEach((sel) => {
		const el = document.querySelector(sel);
		if (el) el.classList.remove("active");
	});
	const activeLine = document.querySelector(lines[current] as string);
	if (activeLine) activeLine.classList.add("active");
}

function changeCoffee(
	isInterval: boolean,
	direction: "left" | "right" = "left"
): void {
	if (isInterval) {
		current = current > 0 ? current - 1 : 2;
	}
	render();
	playCycle(direction);
}

function playCycle(direction: "left" | "right" = "left"): void {
	drink.style.animation = "none";
	void drink.offsetWidth; // force reflow
	const base = "slideInHoldOut 3000ms ease-in-out";
	const dir = direction === "right" ? "reverse" : "normal";
	drink.style.animation = `${base} ${dir} forwards`;
}

function render(): void {
	if (!isHome()) return;
	drink.innerHTML = "";
	createImage();
	createDrinkName();
	createDrinkInfo();
	createDrinkPrice();
	changeActive();
}

function tick(): void {
	if (!isHome()) {
		schedule(INTERVAL);
		return;
	}
	changeCoffee(true, "left");
	remaining = INTERVAL;
	schedule(INTERVAL);
}

function schedule(delay: number = remaining): void {
	if (timer) clearTimeout(timer);
	remaining = delay;
	startedAt = performance.now();
	timer = window.setTimeout(tick, delay);
}

function pause(): void {
	if (!timer) return;
	clearTimeout(timer);
	timer = null;
	const elapsed = performance.now() - startedAt;
	remaining = Math.max(0, remaining - elapsed);

	drink.style.animationPlayState = "paused";
	const activeLine = document.querySelector(
		lines[current] as string
	) as HTMLElement;
	if (activeLine) {
		activeLine.classList.remove("resume");
		activeLine.classList.add("paused");
	}
}

function resume(): void {
	if (timer) return;
	drink.style.animationPlayState = "running";
	const activeLine = document.querySelector(
		lines[current] as string
	) as HTMLElement;
	if (activeLine) {
		activeLine.classList.remove("paused");
		activeLine.classList.add("resume");
	}
	schedule(remaining || INTERVAL);
}

// Initial schedule on next animation frames
requestAnimationFrame(() => requestAnimationFrame(() => schedule(INTERVAL)));

drink.addEventListener("pointerenter", pause);
["pointerleave", "pointercancel"].forEach((ev) =>
	drink.addEventListener(ev, resume)
);

drink.addEventListener("animationend", (e: AnimationEvent) => {
	if (e.animationName === "slideInHoldOut") {
		drink.style.transform = "none";
	}
});

left_button.addEventListener("click", () => {
	pause();
	current = current > 0 ? current - 1 : 2;
	changeCoffee(false, "left");
	remaining = INTERVAL;
	resume();
});

right_button.addEventListener("click", () => {
	pause();
	current = current < 2 ? current + 1 : 0;
	changeCoffee(false, "right");
	remaining = INTERVAL;
	resume();
});

slider.addEventListener("touchstart", (e: TouchEvent) => {
	startX = e.touches[0]!.clientX;
	endX = startX;
});

slider.addEventListener("touchmove", (e: TouchEvent) => {
	endX = e.touches[0]!.clientX;
});

slider.addEventListener("touchend", () => {
	const deltaX = endX - startX;
	const minSwipeDistance = 50;

	if (Math.abs(deltaX) > minSwipeDistance) {
		if (deltaX < 0) {
			left_button.click();
		} else {
			right_button.click();
		}
	}

	startX = 0;
	endX = 0;
});

button.addEventListener("click", () => menu_link.click());

menu_link.addEventListener("click", async (e: Event) => {
	const target = e.currentTarget as HTMLElement;
	target.classList.add("disable_cursor");

	menu_link.style.borderBottom = "2px solid #403f3d";
	// cart_button.style.display = "inline";
	cart_button.classList.remove("disable_cursor");
	cart_button.style.borderBottom = "";
	cross.click();
	//

	if (data.length === 0) {
		const success = await getProducts();
		if (!success) return;
	}

	const h1 = document.createElement("h1");
	const buttons = document.createElement("div");
	const content = document.createElement("div");
	const load_more_button = document.createElement("div");

	h1.innerHTML = `Behind each of our cups <br />
	              hides an <span>amazing surprise</span>`;
	buttons.innerHTML = `
		<div class="button coffee">
		  <img src="assets/coffee.png" alt="" />
		  <p>Coffee</p>
		</div>
		<div class="button tea">
		  <img src="assets/tea.png" alt="" />
		  <p>Tea</p>
		</div>
		<div class="button dessert">
		  <img src="assets/dessert.png" alt="" />
		  <p>Dessert</p>
		</div>`;
	load_more_button.innerHTML = `<i class="fa-solid fa-rotate-right"></i>`;

	main.classList.remove("home");
	main.classList.add("menu");
	buttons.classList.add("buttons");
	content.classList.add("content");
	load_more_button.classList.add("load-button");

	main.innerHTML = "";

	main.appendChild(h1);
	main.appendChild(buttons);
	main.appendChild(content);
	main.appendChild(load_more_button);

	// Function to render products of a specific category
	async function renderCategory(category: "coffee" | "tea" | "dessert") {
		const buttonsEls = buttons.querySelectorAll<HTMLElement>(".button");
		buttonsEls.forEach((btn) => btn.classList.remove("disable_cursor"));

		const activeButton = buttons.querySelector(`.${category}`) as HTMLElement;
		activeButton.classList.add("disable_cursor");

		// await getProducts(); // assuming this updates global `data`

		content.innerHTML = "";
		current_product.type = category;
		filteredData = fullData.filter((el) => el.category === category);

		const srcMap = {
			coffee: productImages.coffee,
			tea: productImages.tea,
			dessert: productImages.dessert,
		};

		const sources = srcMap[category];

		filteredData.forEach((item, i) => {
			const img = document.createElement("img");
			const name = document.createElement("h3");
			const description = document.createElement("p");
			const block = document.createElement("div");
			const info_block = document.createElement("div");
			const price = document.createElement("p");

			block.classList.add("block");
			info_block.classList.add("info_block");
			price.classList.add("price");

			name.textContent = item.name;
			description.textContent = item.description;
			price.textContent = `$${item.price}`;
			img.src = sources[i] as string;
			img.alt = `${category}-${i}`;

			block.appendChild(img);
			info_block.appendChild(name);
			info_block.appendChild(description);
			info_block.appendChild(price);
			block.appendChild(info_block);

			content.appendChild(block);
		});

		content.dispatchEvent(new Event("contentchange"));
	}

	buttons.querySelectorAll<HTMLElement>(".button").forEach((btn) => {
		btn.addEventListener("click", () => {
			buttons.querySelectorAll<HTMLElement>(".button").forEach((b) => {
				b.classList.remove("clicked");
			});
			btn.classList.add("clicked");
		});
	});

	// Coffee button
	buttons.querySelector(".coffee")?.addEventListener("click", () => {
		renderCategory("coffee");
	});

	// Tea button
	buttons.querySelector(".tea")?.addEventListener("click", () => {
		renderCategory("tea");
	});

	// Dessert button
	buttons.querySelector(".dessert")?.addEventListener("click", () => {
		renderCategory("dessert");
	});

	// Handling content change event
	content.addEventListener("contentchange", () => {
		blocks = Array.from(document.querySelectorAll<HTMLElement>(".block"));
		productsExpanded = false;
		handleResponsiveDisplay();
		// getProducts();

		blocks.forEach((block, i) => {
			block.addEventListener("click", async () => {
				const img = block.querySelector("img");
				if (!img) return;
				modal_photo.src = img.src;
				modal_photo.alt = `modal-photo-${i}`;
				current_product.id =
					modal_photo.src.split("/").pop()?.split(".")[0] || "";
				// try {
				document.body.classList.add("modal-open");
				backdrop.style.display = "block";
				product = await getProduct(current_product.id);
				if (!product) {
					console.log("error");
					// backdrop.removeChild(loader);
					return;
				}
				// backdrop.removeChild(loader);
				// console.log(product);
				modal.style.display = "flex";

				// document
				// 	.querySelector(".modal .small")
				// 	?.classList.add("modal_button_active");
				// current_product.size = "s";
				modal_name.textContent = product.name;
				modal_description.textContent = product.description;

				current_product.adds = [];
				current_product.index = i;

				createSizes();

				// S.textContent = product.sizes.s.size ?? "";
				// M.textContent = product.sizes.m.size ?? "";
				// L.textContent = product.sizes.l.size ?? "";

				createAdditives();

				//		first_additive.textContent = product.additives[0]?.name ?? "";
				//	second_additive.textContent = product.additives[1]?.name ?? "";
				//	third_additive.textContent = product.additives[2]?.name ?? "";

				total_price.textContent = product.price ? `$${product.price}` : "";
				// } catch (error) {
				// 	const err = document.createElement("div");
				// 	err.textContent = "Something went wrong. Please, refresh the page";
				// 	err.style.fontSize = "100px";
				// 	backdrop.appendChild(err);
				// 	console.log(error);
				// }

				// document.body.classList.add("modal-open");
				// backdrop.style.display = "block";

				// Filter data based on image src
				// if (modal_photo.src.includes("coffee")) {
				// 	filteredData = fullData.filter((el) => el.category === "coffee");
				// 	current_product.type = "coffee";
				// } else if (modal_photo.src.includes("tea")) {
				// 	filteredData = fullData.filter((el) => el.category === "tea");
				// 	current_product.type = "tea";
				// } else if (modal_photo.src.includes("dessert")) {
				// 	filteredData = fullData.filter((el) => el.category === "dessert");
				// 	current_product.type = "dessert";
				// }

				// Delete this ^ from my old project coffee house AND add some changes to THIS project, .adds = [] and modal_photo.src.split("/") etc
			});
		});
	});

	// Initial load coffee category
	buttons.querySelector<HTMLElement>(".coffee")?.click();

	const createAdditives = () => {
		const divs = ["first", "second", "third"];
		const p1s = ["additive_one", "additive_two", "additive_three"];
		const p2s = ["first_additive", "second_additive", "third_additive"];

		additives_block.innerHTML = "";

		product?.additives.forEach((additive, i) => {
			const div = document.createElement("div");
			const p1 = document.createElement("p");
			const p2 = document.createElement("p");
			div.className = divs[i] ?? "";
			p1.className = p1s[i] ?? "";
			p2.classList = p2s[i] ?? "";
			p1.textContent = (i + 1).toString();
			p2.textContent = additive.name;

			div.addEventListener("click", () => {
				div.classList.toggle("modal_button_active");
				// filter();
				additiveFilter(i);
				updateTotal();
			});

			div.appendChild(p1);
			div.appendChild(p2);
			additives_block.appendChild(div);
		});
	};

	const createSizes = () => {
		const divs = {
			s: "small",
			m: "medium",
			l: "large",
			xl: "extra_large",
			xxl: "extra_extra_large",
		};
		const p1s: SizeKey[] = ["s", "m", "l", "xl", "xxl"];

		const sizeDivs: HTMLElement[] = [];

		sizes_block.innerHTML = "";

		p1s.forEach((key) => {
			const size = product?.sizes?.[key];
			if (!size) return;
			const div = document.createElement("div");
			const p1 = document.createElement("p");
			const p2 = document.createElement("p");

			div.className = divs[key] ?? "";

			p1.textContent = key.toUpperCase() ?? "";
			p2.textContent = size.size;

			p1.className = key;
			p2.className = `size_${key}`;

			div.appendChild(p1);
			div.appendChild(p2);
			sizes_block.appendChild(div);

			sizeDivs.push(div);

			div.addEventListener("click", () => {
				sizeDivs.forEach((b) => b.classList.remove("modal_button_active"));
				div.classList.add("modal_button_active");
				current_product.size = key;
				// filter();
				updateTotal();
			});
		});

		// btn.addEventListener("click", () => {
		// 	sizeDivs.forEach((b) => b.classList.remove("modal_button_active"));
		// 	btn.classList.add("modal_button_active");

		// 	current_product.size = p1s[i] as SizeKey;
		// 	console.log(current_product.size);
		// 	filter();
		// 	updateTotal();
		// });
		// });

		sizeDivs[0]?.classList.add("modal_button_active");
		current_product.size = "s";

		// 		button_S.addEventListener("click", () => {
		// 	current_product.size = "s";
		// 	filter();
		// 	updateTotal();
		// });

		// button_M.addEventListener("click", () => {
		// 	current_product.size = "m";
		// 	filter();
		// 	updateTotal();
		// });

		// button_L.addEventListener("click", () => {
		// 	current_product.size = "l";
		// 	filter();
		// 	updateTotal();
		// });
	};

	const rotate_arrow =
		load_more_button.querySelector<HTMLElement>(".fa-rotate-right");
	let rotation = 0;

	rotate_arrow?.addEventListener("click", () => {
		rotation += 360;
		if (rotate_arrow) {
			rotate_arrow.style.transform = `rotate(${rotation}deg)`;
			rotate_arrow.style.transition = `.5s`;
		}
		setTimeout(loadAllProducts, 500);
	});

	rotate_arrow?.addEventListener("transitionend", () => {
		load_more_button.style.display = "none";
	});

	function handleResponsiveDisplay(): void {
		const rotateArrow =
			load_more_button.querySelector<HTMLElement>(".fa-rotate-right");
		const notDesktop = window.innerWidth <= 768;
		const products = content.querySelectorAll<HTMLElement>(".block");

		products.forEach((p) => p.classList.remove("hidden"));

		if (notDesktop && products.length > 4 && !productsExpanded) {
			products.forEach((p, i) => {
				if (i >= 4) p.classList.add("hidden");
			});
			load_more_button.style.display = "block";
		} else {
			load_more_button.style.display = "none";
		}

		if (rotateArrow) rotateArrow.style.transition = "none";
	}

	function loadAllProducts(): void {
		const hiddenProducts =
			content.querySelectorAll<HTMLElement>(".block.hidden");
		hiddenProducts.forEach((p) => p.classList.remove("hidden"));
		productsExpanded = true;
	}

	window.addEventListener("resize", handleResponsiveDisplay);
});

links.forEach((link, i) => {
	link.addEventListener("click", () => {
		if (i !== 4) {
			if (i === 0) cross.click();
			menu_link.style.borderBottom = "";
			menu_link.classList.remove("disable_cursor");
			cart_button.style.display = "none";
			main.classList.remove("menu");
			main.classList.add("home");
			main.replaceChildren(...backup);
			document.querySelector<HTMLVideoElement>("video")!.play();

			remaining = INTERVAL;
			render();
			schedule(INTERVAL);
		}
	});
});

burger_menu_links.forEach((link, i) => {
	link.addEventListener("click", () => {
		if (i === 4) {
			menu_link.click();
		} else if (i !== 3) {
			cross.click();
			menu_link.classList.remove("disable_cursor");
			main.classList.remove("menu");
			main.classList.add("home");
			main.replaceChildren(...backup);
			document.querySelector<HTMLVideoElement>("video")!.play();

			remaining = INTERVAL;
			render();
			schedule(INTERVAL);
		} else {
			cross.click();
		}
	});
});

window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
	if (e.matches) {
		burger_menu.classList.remove("is-open");
		header.classList.remove("menu-open");
		burger_menu.style.display = "none";
		isOpen = false;
		isTransitioning = false;
	}
});

bars.addEventListener("click", openMenu);

cross.addEventListener("click", closeMenu);

function openMenu(): void {
	if (isOpen || isTransitioning) return;
	isTransitioning = true;

	burger_menu.style.display = "block";

	// Trigger reflow to enable transition
	burger_menu.getBoundingClientRect();

	burger_menu.classList.add("is-open");
	header.classList.add("menu-open");

	const onEnd = (e: TransitionEvent) => {
		if (e.propertyName === "transform") {
			isTransitioning = false;
			isOpen = true;
			burger_menu.removeEventListener("transitionend", onEnd);
		}
	};
	burger_menu.addEventListener("transitionend", onEnd);
}

function closeMenu(): void {
	if (!isOpen || isTransitioning) return;
	isTransitioning = true;

	burger_menu.classList.remove("is-open");
	header.classList.remove("menu-open");

	const onEnd = (e: TransitionEvent) => {
		if (e.propertyName === "transform") {
			burger_menu.style.display = "none";
			isTransitioning = false;
			isOpen = false;
			burger_menu.removeEventListener("transitionend", onEnd);
		}
	};
	burger_menu.addEventListener("transitionend", onEnd);
}

const updateTotal = (): void => {
	// const item = filteredData[current_product.index];
	// console.log(fullData);
	// console.log(filteredData);
	// const base = parseFloat(product?.price ?? "0");

	const sizeAdd = parseFloat(
		product?.sizes?.[current_product.size]?.["price"] ?? "0"
	);
	console.log(sizeAdd);

	const addsSum = current_product.adds.reduce(
		(s, i) => s + parseFloat(product?.additives?.[i]?.["price"] ?? "0"),
		0
	);

	console.log(addsSum);

	const total = sizeAdd + addsSum;
	total_price.textContent = `$${total.toFixed(2)}`;
};

// const filter = (): void => {
// 	if (current_product.type === "coffee")
// 		filteredData = fullData.filter((el) => el.category === "coffee");
// 	else if (current_product.type === "tea")
// 		filteredData = fullData.filter((el) => el.category === "tea");
// 	else if (current_product.type === "dessert")
// 		filteredData = fullData.filter((el) => el.category === "dessert");
// };

const additiveFilter = (num: number): void => {
	if (current_product.adds.includes(num))
		current_product.adds = current_product.adds.filter(
			(additive) => additive !== num
		);
	else {
		current_product.adds.push(num);
	}
};

// [button_S, button_M, button_L].forEach((btn) => {
// 	btn.addEventListener("click", () => {
// 		[button_S, button_M, button_L].forEach((b) => {
// 			b.classList.remove("modal_button_active");
// 		});
// 		btn.classList.add("modal_button_active");
// 	});
// });

// [button_first_additive, button_second_additive, button_third_additive].forEach(
// 	(btn) => {
// 		btn.addEventListener("click", () => {
// 			btn.classList.toggle("modal_button_active");
// 		});
// 	}
// );

// button_first_additive.addEventListener("click", () => {
// 	filter();
// 	additiveFilter(0);
// 	updateTotal();
// });
// button_second_additive.addEventListener("click", () => {
// 	filter();
// 	additiveFilter(1);
// 	updateTotal();
// });
// button_third_additive.addEventListener("click", () => {
// 	filter();
// 	additiveFilter(2);
// 	updateTotal();
// });

backdrop.addEventListener("click", () => close.click());

close.addEventListener("click", () => {
	document.body.classList.remove("modal-open");
	backdrop.style.display = "none";
	modal.style.display = "none";

	[
		document.querySelector(".modal .small"),
		document.querySelector(".modal .medium"),
		document.querySelector(".modal .large"),
		document.querySelector(".modal .first_additive"),
		document.querySelector(".modal .second_additive"),
		document.querySelector(".modal .third_additive"),
	].forEach((btn) => {
		btn?.classList.remove("modal_button_active");
	});
	// current_product.adds = [];
	// product = null;
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
	if (e.key === "Escape" && modal.style.display === "flex") {
		close.click();
	}
});

add_cart.addEventListener("click", () => {
	close.click();
	cart_button.style.display = "inline";
	addToCart();
	// cart_button.classList.remove("disable_cursor");
	// cart_button.style.borderBottom = "";
});

const addToCart = (): void => {
	const stored = localStorage.getItem("cartCount");
	count = stored !== null ? parseInt(stored) : 0;

	const storedCart = localStorage.getItem("cart");
	const cart: Product[] = storedCart ? JSON.parse(storedCart) : [];

	if (product) {
		cart.push(product);
		localStorage.setItem("cart", JSON.stringify(cart));
	}

	// } catch (error) {
	// 	const err = document.createElement("div");
	// 	err.textContent = "Something went wrong. Please, refresh the page";
	// 	err.style.fontSize = "100px";
	// 	backdrop.appendChild(err);
	// 	console.log(error);
	// }

	count++;
	localStorage.setItem("cartCount", count.toString());

	updateCartNumber();
};

const updateCartNumber = (): void => {
	const cart_number = document.querySelector(".cart_number") as HTMLElement;
	count = parseInt(localStorage.getItem("cartCount") || "0");

	if (cart_number) {
		cart_number.textContent = count > 0 ? count.toString() : "";
	}
};

const updateCart = (): void => {
	const cart_products = document.querySelector(".cart_products") as HTMLElement;
	cart_products.innerHTML = "";
	const cart = localStorage.getItem("cart");

	if (cart) {
		const cartProducts: Product[] = JSON.parse(cart);

		cartProducts.forEach((product) => {
			const trash: HTMLElement = document.createElement("i");
			const productInfo: HTMLElement = document.createElement("div");
			const productRow: HTMLElement = document.createElement("div");
			const img: HTMLImageElement = document.createElement("img");
			const product_name: HTMLElement = document.createElement("p");
			const product_price: HTMLElement = document.createElement("p");

			trash.classList.add("fa-solid", "fa-trash");
			productInfo.className = "product_info";
			productRow.className = "product_row";
			img.src =
				product.category === "coffee"
					? `images/${product.id}.jpg `
					: `images/${product.id}.png`;

			product_name.textContent = product.name;
			product_price.textContent = `$${product.price}`;

			console.log(current_product);

			trash.addEventListener("click", () => {
				const indexToRemove = cartProducts.findIndex(
					(p) => p.id === product.id
				);

				if (indexToRemove !== -1) {
					cartProducts.splice(indexToRemove, 1);
					localStorage.setItem("cart", JSON.stringify(cartProducts));

					let count = parseInt(localStorage.getItem("cartCount") || "0");
					count = Math.max(0, count - 1);
					localStorage.setItem("cartCount", count.toString());

					updateCartNumber();
					updateCart();
				}

				// const updatedCart = cartProducts.filter((p) => p.id !== product.id);
				// localStorage.setItem("cart", JSON.stringify(updatedCart));

				// const newCount = updateCart.length;
				// localStorage.setItem("cartCount", newCount.toString());
			});

			productInfo.appendChild(trash);
			productInfo.appendChild(img);
			productInfo.appendChild(product_name);

			productRow.appendChild(productInfo);
			productRow.appendChild(product_price);

			cart_products?.appendChild(productRow);
		});
	}
};

cart_button.addEventListener("click", () => {
	main.classList.remove("menu");
	main.classList.add("cart");
	cart_button.classList.add("disable_cursor");
	menu_link.classList.remove("disable_cursor");

	cart_button.style.borderBottom = "2px solid #403f3d";
	menu_link.style.borderBottom = "";

	main.innerHTML = "";

	const h1 = document.createElement("h1");
	h1.textContent = "Cart";
	h1.className = "cart";

	const div = document.createElement("div");
	const div2 = document.createElement("div");
	const p1 = document.createElement("p");
	const p2 = document.createElement("p");
	p1.textContent = "Total:";
	p2.textContent = "$0.00";
	p1.className = "cart_total";
	p2.className = "cart_price";
	div.className = "cart_total_price";
	div2.className = "cart_products";

	div.appendChild(p1);
	div.appendChild(p2);

	const sign_in = document.createElement("div");
	sign_in.textContent = "Sign In";
	sign_in.className = "sign_in";

	const registration = document.createElement("div");
	registration.textContent = "Registration";
	registration.className = "registration";

	const buttons = document.createElement("div");
	buttons.className = "cart_buttons";

	buttons.appendChild(sign_in);
	buttons.appendChild(registration);

	main.appendChild(h1);
	main.appendChild(div2);
	main.appendChild(div);
	main.appendChild(buttons);

	// sign_in.addEventListener("click", () => {
	// 	main.classList.remove("cart");
	// 	main.classList.add("login");

	// 	main.innerHTML = "";

	// 	const h1 = document.createElement("h1");
	// 	h1.textContent = "Sign In";

	// 	const label_login = document.createElement("label");
	// 	const label_password = document.createElement("label");
	// 	const input_login = document.createElement("input");
	// 	const input_password = document.createElement("input");
	// 	const sign_in = document.createElement("div");

	// 	label_login.textContent = "Login";
	// 	label_password.textContent = "Password";

	// 	input_login.placeholder = "Placeholder";
	// 	input_password.placeholder = "Placeholder";

	// 	input_password.type = "password";

	// 	label_login.className = "label_login";
	// 	label_password.className = "label_password";

	// 	input_login.className = "input_login";
	// 	input_password.className = "input_password";

	// 	sign_in.textContent = "Sign In";
	// 	sign_in.className = "sign_in";

	// 	label_login.appendChild(input_login);
	// 	label_password.appendChild(input_password);

	// 	main.appendChild(h1);
	// 	main.appendChild(label_login);
	// 	main.appendChild(label_password);
	// 	main.appendChild(sign_in);
	// });

	// registration.addEventListener("click", () => {
	// 	main.classList.remove("cart");
	// 	main.classList.add("register");

	// 	main.innerHTML = "";

	// 	// main.appendChild
	// });

	updateCart();
});

getFavorites(); //initial
