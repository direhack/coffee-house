// 🍹 DOM Elements
const main = document.querySelector("main") as HTMLElement;
const header = document.querySelector("header") as HTMLElement;
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

// Other modal elements
const total_price = document.querySelector(
	".modal .total_price"
) as HTMLElement;

// 🥤 Media Sources (arrays of image URLs)
const coffee_src: string[] = [];
const tea_src: string[] = [];
const dessert_src: string[] = [];
const drinks: string[] = [];

// ⚙️ State and Data Variables
let current: number = 0; // current index for slideshow
let startX: number = 0; // touch start X coordinate
let endX: number = 0; // touch end X coordinate

let data: Product[] = []; // fetched product data (type `any` for now)
let blocks: HTMLElement[] = []; // some collection of blocks in UI (usage not shown here)

let productsExpanded: boolean = false;
let isTransitioning: boolean = false;
let isOpen: boolean = false;

// 🛒 Current Product Info
interface CurrentProduct {
	adds: number[];
	size: keyof (typeof data)[0]["sizes"];
	index: number;
	type: string;
}

const current_product: CurrentProduct = {
	adds: [],
	size: "s",
	index: 0,
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
type SizeKey = "s" | "m" | "l";

type Size = {
	size: string;
	"add-price": string;
};

type Additive = {
	name: string;
	"add-price": string;
};

type Product = {
	name: string;
	description: string;
	price: string;
	category: string;
	sizes: Record<SizeKey, Size>;
	additives: Additive[];
};

// API REQUESTS

async function getFavorites(): Promise<void> {
	try {
		loader.style.display = "block";
		slider.style.display = "none";
		three_lines.style.display = "none";
		const response = await fetch(
			"http://coffee-shop-be.eu-central-1.elasticbeanstalk.com/products/favorites"
		);
		if (!response.ok) {
			loader.textContent = "Something went wrong. Please, refresh the page";
			throw new Error("Network response was not ok");
		}
		data = await response.json();
		loader.style.display = "none";
		slider.style.display = "flex";
		three_lines.style.display = "flex";
	} catch (error) {
		console.log("Error fetching data:", error);
	}
}

getFavorites(); // add to the end

async function getAllProducts(): Promise<void> {
	const response = await fetch(
		"http://coffee-shop-be.eu-central-1.elasticbeanstalk.com/products"
	);
	if (!response.ok) {
		throw new Error("Network response was no ok");
	}
	data = await response.json();
	console.log(data);
}

//

async function getProducts(): Promise<void> {
	try {
		const response = await fetch("products.json");
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		data = await response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

for (let i = 1; i <= 3; i++) {
	drinks.push(`assets/coffee-slider-${i}.png`);
}

for (let i = 1; i <= 8; i++) {
	coffee_src.push(`assets/coffee-${i}.jpg`);
	dessert_src.push(`assets/dessert-${i}.png`);
}

for (let i = 1; i <= 4; i++) {
	tea_src.push(`assets/tea-${i}.png`);
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
	const drinks_names = [
		"S’mores Frappuccino",
		"Caramel Macchiato",
		"Ice coffee",
	];
	const drink_name = document.createElement("h3");
	drink_name.textContent = drinks_names[current] as string;
	drink_name.className = "drink-name";
	drink.appendChild(drink_name);
}

function createDrinkInfo(): void {
	const drinks_info = [
		"This new drink takes an espresso and mixes it with brown sugar and cinnamon before being topped with oat milk.",
		"Fragrant and unique classic espresso with rich caramel-peanut syrup, with cream under whipped thick foam.",
		"A popular summer drink that tones and invigorates. Prepared from coffee, milk and ice.",
	];
	const drink_info = document.createElement("p");
	drink_info.textContent = drinks_info[current] as string;
	drink_info.className = "drink-info";
	drink.appendChild(drink_info);
}

function createDrinkPrice(): void {
	const drink_prices = ["$5.50", "$5.00", "$4.50"];
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
	cross.click();
	//
	main.innerHTML = "";
	const h1 = document.createElement("h1");
	h1.innerHTML = `Behind each of our cups <br />
                  hides an <span>amazing surprise</span>`;
	main.appendChild(h1);

	const loader = document.createElement("div");
	loader.className = "second-loader";
	loader.textContent = "Loading...";
	main.appendChild(loader);

	let buttons: HTMLDivElement,
		content: HTMLDivElement,
		load_more_button: HTMLDivElement; // Put them above

	try {
		await getAllProducts();
		main.removeChild(loader);

		buttons = document.createElement("div");
		content = document.createElement("div");
		load_more_button = document.createElement("div");

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

		main.appendChild(buttons);
		main.appendChild(content);
		main.appendChild(load_more_button);

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

		// Initial load coffee category
		buttons.querySelector<HTMLElement>(".coffee")?.click();

		// Handling content change event
		content.addEventListener("contentchange", () => {
			blocks = Array.from(document.querySelectorAll<HTMLElement>(".block"));
			productsExpanded = false;
			handleResponsiveDisplay();
			getProducts();

			blocks.forEach((block, i) => {
				block.addEventListener("click", () => {
					document.body.classList.add("modal-open");
					backdrop.style.display = "block";
					modal.style.display = "flex";

					button_S.classList.add("modal_button_active");
					current_product.size = "s";

					const img = block.querySelector("img");
					if (!img) return;
					modal_photo.src = img.src;
					modal_photo.alt = `modal-photo-${i}`;

					// Filter data based on image src
					if (modal_photo.src.includes("coffee")) {
						data = data.filter((el) => el.category === "coffee");
						current_product.type = "coffee";
					} else if (modal_photo.src.includes("tea")) {
						data = data.filter((el) => el.category === "tea");
						current_product.type = "tea";
					} else if (modal_photo.src.includes("dessert")) {
						data = data.filter((el) => el.category === "dessert");
						current_product.type = "dessert";
					}

					current_product.index = i;
					modal_name.textContent = data[i]?.name ?? "";
					modal_description.textContent = data[i]?.description ?? "";

					S.textContent = data[i]?.sizes.s.size ?? "";
					M.textContent = data[i]?.sizes.m.size ?? "";
					L.textContent = data[i]?.sizes.l.size ?? "";

					first_additive.textContent = data[i]?.additives[0]?.name ?? "";
					second_additive.textContent = data[i]?.additives[1]?.name ?? "";
					third_additive.textContent = data[i]?.additives[2]?.name ?? "";

					total_price.textContent = data[i]?.price ? `$${data[i].price}` : "";
				});
			});
		});

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
	} catch (error) {
		main.classList.remove("home");
		main.classList.add("menu");
		loader.textContent = "Something went wrong. Please, refresh the page";
		console.log("Error fetching data:", error);
	}

	// Function to render products of a specific category
	async function renderCategory(category: "coffee" | "tea" | "dessert") {
		const buttonsEls = buttons.querySelectorAll<HTMLElement>(".button");
		buttonsEls.forEach((btn) => btn.classList.remove("disable_cursor"));

		const activeButton = buttons.querySelector(`.${category}`) as HTMLElement;
		activeButton.classList.add("disable_cursor");

		await getProducts(); // assuming this updates global `data`

		content.innerHTML = "";
		const filteredData = data.filter((el) => el.category === category);

		const srcMap = {
			coffee: coffee_src,
			tea: tea_src,
			dessert: dessert_src,
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
});

links.forEach((link, i) => {
	link.addEventListener("click", () => {
		if (i !== 4) {
			if (i === 0) cross.click();
			menu_link.style.borderBottom = "";
			menu_link.classList.remove("disable_cursor");
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
	const item = data[current_product.index];

	const base = parseFloat(item?.price ?? "0");
	const sizeAdd = parseFloat(
		item?.sizes?.[current_product.size]?.["add-price"] ?? "0"
	);

	const addsSum = current_product.adds.reduce(
		(s, i) => s + parseFloat(item?.additives?.[i]?.["add-price"] ?? "0"),
		0
	);

	const total = base + sizeAdd + addsSum;
	total_price.textContent = `$${total.toFixed(2)}`;
};

const filter = (): void => {
	if (current_product.type === "coffee")
		data = data.filter((el) => el.category === "coffee");
	else if (current_product.type === "tea")
		data = data.filter((el) => el.category === "tea");
	else if (current_product.type === "dessert")
		data = data.filter((el) => el.category === "dessert");
};

const additiveFilter = (num: number): void => {
	if (current_product.adds.includes(num))
		current_product.adds = current_product.adds.filter(
			(additive) => additive !== num
		);
	else {
		current_product.adds.push(num);
	}
};

[button_S, button_M, button_L].forEach((btn) => {
	btn.addEventListener("click", () => {
		[button_S, button_M, button_L].forEach((b) => {
			b.classList.remove("modal_button_active");
		});
		btn.classList.add("modal_button_active");
	});
});

[button_first_additive, button_second_additive, button_third_additive].forEach(
	(btn) => {
		btn.addEventListener("click", () => {
			btn.classList.toggle("modal_button_active");
		});
	}
);

button_S.addEventListener("click", () => {
	current_product.size = "s";
	filter();
	updateTotal();
});

button_M.addEventListener("click", () => {
	current_product.size = "m";
	filter();
	updateTotal();
});

button_L.addEventListener("click", () => {
	current_product.size = "l";
	filter();
	updateTotal();
});

button_first_additive.addEventListener("click", () => {
	filter();
	additiveFilter(0);
	updateTotal();
});
button_second_additive.addEventListener("click", () => {
	filter();
	additiveFilter(1);
	updateTotal();
});
button_third_additive.addEventListener("click", () => {
	filter();
	additiveFilter(2);
	updateTotal();
});

backdrop.addEventListener("click", () => close.click());

close.addEventListener("click", () => {
	document.body.classList.remove("modal-open");
	backdrop.style.display = "none";
	modal.style.display = "none";

	[
		button_S,
		button_M,
		button_L,
		button_first_additive,
		button_second_additive,
		button_third_additive,
	].forEach((btn) => {
		btn.classList.remove("modal_button_active");
	});

	getProducts();
});

render(); // initial render
getProducts();
