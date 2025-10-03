const drink = document.querySelector(".drink"),
	left_button = document.querySelector(".arrow-left"),
	right_button = document.querySelector(".arrow-right"),
	menu_link = document.querySelector(".menu_link"),
	links = document.querySelectorAll(".link"),
	home = document.querySelector(".home"),
	menu = document.querySelector(".menu"),
	coffee = document.querySelector(".coffee"),
	tea = document.querySelector(".tea"),
	dessert = document.querySelector(".dessert"),
	buttons = document.querySelectorAll(".button"),
	coffee_src = [],
	tea_src = [],
	dessert_src = [],
	content = document.querySelector(".content"),
	button = document.querySelector(".home button"),
	close = document.querySelector(".close"),
	backdrop = document.querySelector(".backdrop"),
	modal = document.querySelector(".modal"),
	modal_photo = document.querySelector(".modal_photo"),
	modal_name = document.querySelector(".modal .name"),
	modal_description = document.querySelector(".modal .description"),
	S = document.querySelector(".modal .size_s"),
	M = document.querySelector(".modal .size_m"),
	L = document.querySelector(".modal .size_l"),
	button_S = document.querySelector(".modal .small"),
	button_M = document.querySelector(".modal .medium"),
	button_L = document.querySelector(".modal .large"),
	first_additive = document.querySelector(".modal .first_additive"),
	second_additive = document.querySelector(".modal .second_additive"),
	third_additive = document.querySelector(".modal .third_additive"),
	button_first_additive = document.querySelector(".modal .first"),
	button_second_additive = document.querySelector(".modal .second"),
	button_third_additive = document.querySelector(".modal .third"),
	total_price = document.querySelector(".modal .total_price"),
	current_product = {};

let current = 0,
	data = [],
	blocks = [];

current_product.adds = [];

async function getProducts() {
	try {
		const response = await fetch("/products.json");
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		data = await response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

let drinks = [];

for (let i = 1; i <= 3; i++) {
	drinks.push(`/assets/coffee-slider-${i}.png`);
}

for (let i = 1; i <= 8; i++) {
	coffee_src.push(`/assets/coffee-${i}.jpg`);
	dessert_src.push(`/assets/dessert-${i}.png`);
}
for (let i = 1; i <= 4; i++) {
	tea_src.push(`/assets/tea-${i}.png`);
}

function createImage() {
	let img = document.createElement("img");
	img.src = drinks[current];
	img.alt = `coffee-slider-${current}`;
	drink.appendChild(img);
}

function createDrinkName() {
	let drinks_names = ["S’mores Frappuccino", "Caramel Macchiato", "Ice coffee"];
	let drink_name = document.createElement("h3");
	drink_name.textContent = drinks_names[current];
	drink_name.className = "drink-name";
	drink.appendChild(drink_name);
}

function createDrinkInfo() {
	let drinks_info = [
		"This new drink takes an espresso and mixes it with brown sugar and cinnamon before being topped with oat milk.",
		"Fragrant and unique classic espresso with rich caramel-peanut syrup, with cream under whipped thick foam.",
		"A popular summer drink that tones and invigorates. Prepared from coffee, milk and ice.",
	];
	let drink_info = document.createElement("p");
	drink_info.textContent = drinks_info[current];
	drink_info.className = "drink-info";
	drink.appendChild(drink_info);
}

function createDrinkPrice() {
	let drink_prices = ["$5.50", "$5.00", "$4.50"];
	let drink_price = document.createElement("p");
	drink_price.textContent = drink_prices[current];
	drink_price.className = "price";
	drink.appendChild(drink_price);
}

function changeActive() {
	const lines = [".first_line", ".second_line", ".third_line"];
	lines.forEach((sel) => {
		document.querySelector(sel).classList.remove("active");
	});
	document.querySelector(lines[current]).classList.add("active");
}

function changeCoffee(isInterval) {
	fadeSwap(render);
	if (isInterval) {
		if (current < 2) current++;
		else current = 0;
	}
}

function render() {
	drink.innerHTML = "";
	createImage();
	createDrinkName();
	createDrinkInfo();
	createDrinkPrice();
	changeActive();
}

function fadeSwap(renderFn) {
	drink.style.opacity = "0";
	setTimeout(() => {
		renderFn();
		requestAnimationFrame(() => {
			drink.style.opacity = "1";
		});
	}, 500);
}

let changeCoffeeInterval = setInterval(() => changeCoffee(true), 5000);

button.addEventListener("click", () => {
	menu_link.style.borderBottom = "2px solid #403f3d";
	home.style.display = "none";
	menu.style.display = "block";
	coffee.click();
});

left_button.addEventListener("click", () => {
	current--;
	if (current < 0) current = 2;
	changeCoffee();
	clearInterval(changeCoffeeInterval);
});

right_button.addEventListener("click", () => {
	if (current < 2) current++;
	else current = 0;
	changeCoffee();
	clearInterval(changeCoffeeInterval);
});

menu_link.addEventListener("click", () => {
	menu_link.style.borderBottom = "2px solid #403f3d";
	home.style.display = "none";
	menu.style.display = "block";
	coffee.click();
});

links.forEach((link, i) => {
	link.addEventListener("click", () => {
		if (i !== 4) {
			menu_link.style.borderBottom = "none";
			home.style.display = "block";
			menu.style.display = "none";
		}
	});
});

buttons.forEach((btn) => {
	btn.addEventListener("click", () => {
		buttons.forEach((b) => {
			b.classList.remove("clicked");
		});
		btn.classList.add("clicked");
	});
});

coffee.addEventListener("click", () => {
	getProducts();

	content.innerHTML = "";

	data = data.filter((el) => el.category === "coffee");
	coffee_src.forEach((coffee, i) => {
		let img = document.createElement("img");
		let name = document.createElement("h3");
		let description = document.createElement("p");
		let block = document.createElement("div");
		let info_block = document.createElement("div");
		block.classList.add("block");
		info_block.classList.add("info_block");
		let price = document.createElement("p");
		price.classList.add("price");

		name.textContent = `${data[i].name}`;
		description.textContent = `${data[i].description}`;
		price.textContent = `$${data[i].price}`;
		img.src = coffee;
		img.alt = `coffee-${i}`;

		block.appendChild(img);
		info_block.appendChild(name);
		info_block.appendChild(description);
		info_block.appendChild(price);
		block.appendChild(info_block);

		content.appendChild(block);
	});
	content.dispatchEvent(new Event("contentchange"));
});

tea.addEventListener("click", () => {
	getProducts();

	content.innerHTML = "";
	data = data.filter((el) => el.category === "tea");
	tea_src.forEach((tea, i) => {
		let img = document.createElement("img");
		let name = document.createElement("h3");
		let description = document.createElement("p");
		let block = document.createElement("div");
		let info_block = document.createElement("div");
		block.classList.add("block");
		info_block.classList.add("info_block");
		let price = document.createElement("p");
		price.classList.add("price");

		name.textContent = `${data[i].name}`;
		description.textContent = `${data[i].description}`;
		price.textContent = `$${data[i].price}`;
		img.src = tea;
		img.alt = `tea-${i}`;

		block.appendChild(img);
		info_block.appendChild(name);
		info_block.appendChild(description);
		info_block.appendChild(price);
		block.appendChild(info_block);

		content.appendChild(block);
	});
	content.dispatchEvent(new Event("contentchange"));
});

dessert.addEventListener("click", () => {
	getProducts();

	content.innerHTML = "";
	data = data.filter((el) => el.category === "dessert");
	dessert_src.forEach((dessert, i) => {
		let img = document.createElement("img");
		let name = document.createElement("h3");
		let description = document.createElement("p");
		let block = document.createElement("div");
		let info_block = document.createElement("div");
		block.classList.add("block");
		info_block.classList.add("info_block");
		let price = document.createElement("p");
		price.classList.add("price");

		name.textContent = `${data[i].name}`;
		description.textContent = `${data[i].description}`;
		price.textContent = `$${data[i].price}`;
		img.src = dessert;
		img.alt = `dessert-${i}`;

		block.appendChild(img);
		info_block.appendChild(name);
		info_block.appendChild(description);
		info_block.appendChild(price);
		block.appendChild(info_block);

		content.appendChild(block);
	});
	content.dispatchEvent(new Event("contentchange"));
});

content.addEventListener("contentchange", () => {
	blocks = document.querySelectorAll(".block");

	blocks.forEach((block, i) => {
		block.addEventListener("click", () => {
			document.body.classList.add("modal-open");
			backdrop.style.display = "block";
			modal.style.display = "flex";

			button_S.classList.add("modal_button_active");
			current_product.size = "s";

			modal_photo.src = block.querySelector("img").src;
			modal_photo.alt = `modal-photo-${i}`;

			if (modal_photo.src.includes("coffee"))
				(data = data.filter((el) => el.category === "coffee")),
					(current_product.type = "coffee");
			else if (modal_photo.src.includes("tea"))
				(data = data.filter((el) => el.category === "tea")),
					(current_product.type = "tea");
			else if (modal_photo.src.includes("dessert"))
				(data = data.filter((el) => el.category === "dessert")),
					(current_product.type = "dessert");

			current_product.index = i;
			modal_name.textContent = `${data[i].name}`;
			modal_description.textContent = `${data[i].description}`;

			S.textContent = `${data[i].sizes.s.size}`;
			M.textContent = `${data[i].sizes.m.size}`;
			L.textContent = `${data[i].sizes.l.size}`;

			first_additive.textContent = `${data[i].additives[0].name}`;
			second_additive.textContent = `${data[i].additives[1].name}`;
			third_additive.textContent = `${data[i].additives[2].name}`;

			total_price.textContent = `$${data[i].price}`;

			getProducts();
		});
	});
});

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

const updateTotal = () => {
	const item = data[current_product.index];

	const base = parseFloat(item.price);
	const sizeAdd = parseFloat(item.sizes[current_product.size]["add-price"]);

	const addsSum = current_product.adds.reduce(
		(s, i) => s + parseFloat(item.additives[i]["add-price"]),
		0
	);

	const total = base + sizeAdd + addsSum;
	total_price.textContent = `$${total.toFixed(2)}`;
};

const filter = () => {
	if (current_product.type === "coffee")
		data = data.filter((el) => el.category === "coffee");
	else if (current_product.type === "tea")
		data = data.filter((el) => el.category === "tea");
	else if (current_product.type === "dessert")
		data = data.filter((el) => el.category === "dessert");
};

const additiveFilter = (num) => {
	if (current_product.adds.includes(num))
		current_product.adds = current_product.adds.filter(
			(additive) => additive !== num
		);
	else {
		current_product.adds.push(num);
	}
};

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

changeCoffee();
getProducts();
