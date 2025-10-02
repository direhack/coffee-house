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
	content = document.querySelector(".content");
let current = 0;

async function getProducts() {
	try {
		const response = await fetch("/products.json");
		if (!response.ok) {
			throw new Error("Network response was not ok");
		}
		const data = await response.json();
	} catch (error) {
		console.error("Error fetching data:", error);
	}
}

getProducts();

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
		if (i !== 3) {
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
			content.innerHTML = "";
		});
		btn.classList.add("clicked");
	});
});

coffee.addEventListener("click", () => {
	coffee_src.forEach((coffee, i) => {
		let img = document.createElement("img");
		img.src = coffee;
		console.log(coffee);
		img.alt = `coffee-${i}`;
		content.appendChild(img);
	});
});

changeCoffee();
