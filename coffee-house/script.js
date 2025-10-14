// 🍹 DOM Elements
const main = document.querySelector("main");
const header = document.querySelector("header");
const drink = document.querySelector(".drink");
const slider = document.querySelector(".slider");
const left_button = document.querySelector(".arrow-left");
const right_button = document.querySelector(".arrow-right");
const menu_link = document.querySelector(".menu_link");
const links = document.querySelectorAll(".link");
const bars = document.querySelector(".fa-bars");
const cross = document.querySelector(".fa-xmark");
const burger_menu = document.querySelector(".burger-menu");
const burger_menu_links = document.querySelectorAll(".burger_menu_link");
// const content = document.querySelector(".content") as HTMLElement;
const button = document.querySelector(".home button");
const close = document.querySelector(".close");
const backdrop = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const modal_photo = document.querySelector(".modal_photo");
const modal_name = document.querySelector(".modal .name");
const modal_description = document.querySelector(".modal .description");
// Modal size selectors
const S = document.querySelector(".modal .size_s");
const M = document.querySelector(".modal .size_m");
const L = document.querySelector(".modal .size_l");
// Modal size buttons
const button_S = document.querySelector(".modal .small");
const button_M = document.querySelector(".modal .medium");
const button_L = document.querySelector(".modal .large");
// Additives selectors
const first_additive = document.querySelector(".modal .first_additive");
const second_additive = document.querySelector(".modal .second_additive");
const third_additive = document.querySelector(".modal .third_additive");
// Additives buttons
const button_first_additive = document.querySelector(".modal .first");
const button_second_additive = document.querySelector(".modal .second");
const button_third_additive = document.querySelector(".modal .third");
// Other modal elements
const total_price = document.querySelector(".modal .total_price");
// 🥤 Media Sources (arrays of image URLs)
const coffee_src = [];
const tea_src = [];
const dessert_src = [];
const drinks = [];
// ⚙️ State and Data Variables
let current = 0; // current index for slideshow
let startX = 0; // touch start X coordinate
let endX = 0; // touch end X coordinate
let data = []; // fetched product data (type `any` for now)
let blocks = []; // some collection of blocks in UI (usage not shown here)
let productsExpanded = false;
let isTransitioning = false;
let isOpen = false;
const current_product = {
    adds: [],
    size: "s",
    index: 0,
    type: "coffee",
};
// 🔁 Constants & Timer Variables
const INTERVAL = 3000;
const lines = [".first_line", ".second_line", ".third_line"];
let timer = null;
let startedAt = 0;
let remaining = INTERVAL;
// Utility function to check if we are on the home page (based on main's class)
const isHome = () => main.classList.contains("home");
// Backup of the original main children nodes (to reset DOM if needed)
const backup = Array.from(main.childNodes);
//
async function getProducts() {
    try {
        const response = await fetch("products.json");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        data = await response.json();
    }
    catch (error) {
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
function createImage() {
    const img = document.createElement("img");
    img.src = drinks[current];
    img.alt = `coffee-slider-${current}`;
    img.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
    };
    img.draggable = false;
    drink.appendChild(img);
}
function createDrinkName() {
    const drinks_names = [
        "S’mores Frappuccino",
        "Caramel Macchiato",
        "Ice coffee",
    ];
    const drink_name = document.createElement("h3");
    drink_name.textContent = drinks_names[current];
    drink_name.className = "drink-name";
    drink.appendChild(drink_name);
}
function createDrinkInfo() {
    const drinks_info = [
        "This new drink takes an espresso and mixes it with brown sugar and cinnamon before being topped with oat milk.",
        "Fragrant and unique classic espresso with rich caramel-peanut syrup, with cream under whipped thick foam.",
        "A popular summer drink that tones and invigorates. Prepared from coffee, milk and ice.",
    ];
    const drink_info = document.createElement("p");
    drink_info.textContent = drinks_info[current];
    drink_info.className = "drink-info";
    drink.appendChild(drink_info);
}
function createDrinkPrice() {
    const drink_prices = ["$5.50", "$5.00", "$4.50"];
    const drink_price = document.createElement("p");
    drink_price.textContent = drink_prices[current];
    drink_price.className = "price";
    drink.appendChild(drink_price);
}
function changeActive() {
    if (lines.length < 3)
        return;
    lines.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el)
            el.classList.remove("active");
    });
    const activeLine = document.querySelector(lines[current]);
    if (activeLine)
        activeLine.classList.add("active");
}
function changeCoffee(isInterval, direction = "left") {
    if (isInterval) {
        current = current > 0 ? current - 1 : 2;
    }
    render();
    playCycle(direction);
}
function playCycle(direction = "left") {
    drink.style.animation = "none";
    void drink.offsetWidth; // force reflow
    const base = "slideInHoldOut 3000ms ease-in-out";
    const dir = direction === "right" ? "reverse" : "normal";
    drink.style.animation = `${base} ${dir} forwards`;
}
function render() {
    if (!isHome())
        return;
    drink.innerHTML = "";
    createImage();
    createDrinkName();
    createDrinkInfo();
    createDrinkPrice();
    changeActive();
}
function tick() {
    if (!isHome()) {
        schedule(INTERVAL);
        return;
    }
    changeCoffee(true, "left");
    remaining = INTERVAL;
    schedule(INTERVAL);
}
function schedule(delay = remaining) {
    if (timer)
        clearTimeout(timer);
    remaining = delay;
    startedAt = performance.now();
    timer = window.setTimeout(tick, delay);
}
function pause() {
    if (!timer)
        return;
    clearTimeout(timer);
    timer = null;
    const elapsed = performance.now() - startedAt;
    remaining = Math.max(0, remaining - elapsed);
    drink.style.animationPlayState = "paused";
    const activeLine = document.querySelector(lines[current]);
    if (activeLine) {
        activeLine.classList.remove("resume");
        activeLine.classList.add("paused");
    }
}
function resume() {
    if (timer)
        return;
    drink.style.animationPlayState = "running";
    const activeLine = document.querySelector(lines[current]);
    if (activeLine) {
        activeLine.classList.remove("paused");
        activeLine.classList.add("resume");
    }
    schedule(remaining || INTERVAL);
}
// Initial schedule on next animation frames
requestAnimationFrame(() => requestAnimationFrame(() => schedule(INTERVAL)));
drink.addEventListener("pointerenter", pause);
["pointerleave", "pointercancel"].forEach((ev) => drink.addEventListener(ev, resume));
drink.addEventListener("animationend", (e) => {
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
slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    endX = startX;
});
slider.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
});
slider.addEventListener("touchend", () => {
    const deltaX = endX - startX;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX < 0) {
            left_button.click();
        }
        else {
            right_button.click();
        }
    }
    startX = 0;
    endX = 0;
});
button.addEventListener("click", () => menu_link.click());
menu_link.addEventListener("click", (e) => {
    const target = e.currentTarget;
    target.classList.add("disable_cursor");
    menu_link.style.borderBottom = "2px solid #403f3d";
    cross.click();
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
    // Helper function to safely select a single element
    // function select<T extends Element>(selector: string): T {
    // 	const el = document.querySelector(selector);
    // 	if (!el) throw new Error(`Element not found: ${selector}`);
    // 	return el as T;
    // }
    // Function to render products of a specific category
    async function renderCategory(category) {
        const buttonsEls = buttons.querySelectorAll(".button");
        buttonsEls.forEach((btn) => btn.classList.remove("disable_cursor"));
        const activeButton = buttons.querySelector(`.${category}`);
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
            img.src = sources[i];
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
    // Add event listeners for category buttons
    buttons.querySelectorAll(".button").forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.querySelectorAll(".button").forEach((b) => {
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
    buttons.querySelector(".coffee")?.click();
    // Handling content change event
    content.addEventListener("contentchange", () => {
        blocks = Array.from(document.querySelectorAll(".block"));
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
                if (!img)
                    return;
                modal_photo.src = img.src;
                modal_photo.alt = `modal-photo-${i}`;
                // Filter data based on image src
                if (modal_photo.src.includes("coffee")) {
                    data = data.filter((el) => el.category === "coffee");
                    current_product.type = "coffee";
                }
                else if (modal_photo.src.includes("tea")) {
                    data = data.filter((el) => el.category === "tea");
                    current_product.type = "tea";
                }
                else if (modal_photo.src.includes("dessert")) {
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
                // total_price.textContent = `$${data[i]?.price}`;
                total_price.textContent = data[i]?.price ? `$${data[i].price}` : "";
            });
        });
    });
    // Rotate arrow button
    const rotate_arrow = load_more_button.querySelector(".fa-rotate-right");
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
    function handleResponsiveDisplay() {
        const rotateArrow = load_more_button.querySelector(".fa-rotate-right");
        const notDesktop = window.innerWidth <= 768;
        const products = content.querySelectorAll(".block");
        products.forEach((p) => p.classList.remove("hidden"));
        if (notDesktop && products.length > 4 && !productsExpanded) {
            products.forEach((p, i) => {
                if (i >= 4)
                    p.classList.add("hidden");
            });
            load_more_button.style.display = "block";
        }
        else {
            load_more_button.style.display = "none";
        }
        if (rotateArrow)
            rotateArrow.style.transition = "none";
    }
    function loadAllProducts() {
        const hiddenProducts = content.querySelectorAll(".block.hidden");
        hiddenProducts.forEach((p) => p.classList.remove("hidden"));
        productsExpanded = true;
    }
    window.addEventListener("resize", handleResponsiveDisplay);
});
links.forEach((link, i) => {
    link.addEventListener("click", () => {
        if (i !== 4) {
            if (i === 0)
                cross.click();
            menu_link.style.borderBottom = "";
            menu_link.classList.remove("disable_cursor");
            main.classList.remove("menu");
            main.classList.add("home");
            main.replaceChildren(...backup);
            document.querySelector("video").play();
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
        }
        else if (i !== 3) {
            cross.click();
            menu_link.classList.remove("disable_cursor");
            main.classList.remove("menu");
            main.classList.add("home");
            main.replaceChildren(...backup);
            document.querySelector("video").play();
            remaining = INTERVAL;
            render();
            schedule(INTERVAL);
        }
        else {
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
function openMenu() {
    if (isOpen || isTransitioning)
        return;
    isTransitioning = true;
    burger_menu.style.display = "block";
    // Trigger reflow to enable transition
    burger_menu.getBoundingClientRect();
    burger_menu.classList.add("is-open");
    header.classList.add("menu-open");
    const onEnd = (e) => {
        if (e.propertyName === "transform") {
            isTransitioning = false;
            isOpen = true;
            burger_menu.removeEventListener("transitionend", onEnd);
        }
    };
    burger_menu.addEventListener("transitionend", onEnd);
}
function closeMenu() {
    if (!isOpen || isTransitioning)
        return;
    isTransitioning = true;
    burger_menu.classList.remove("is-open");
    header.classList.remove("menu-open");
    const onEnd = (e) => {
        if (e.propertyName === "transform") {
            burger_menu.style.display = "none";
            isTransitioning = false;
            isOpen = false;
            burger_menu.removeEventListener("transitionend", onEnd);
        }
    };
    burger_menu.addEventListener("transitionend", onEnd);
}
const updateTotal = () => {
    const item = data[current_product.index];
    const base = parseFloat(item?.price ?? "0");
    const sizeAdd = parseFloat(item?.sizes?.[current_product.size]?.["add-price"] ?? "0");
    const addsSum = current_product.adds.reduce((s, i) => s + parseFloat(item?.additives?.[i]?.["add-price"] ?? "0"), 0);
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
        current_product.adds = current_product.adds.filter((additive) => additive !== num);
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
[button_first_additive, button_second_additive, button_third_additive].forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("modal_button_active");
    });
});
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
export {};
//# sourceMappingURL=script.js.map
