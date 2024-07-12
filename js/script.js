let validateForm = {
  userName: {
    regex: /^[a-z0-9_-]{3,15}$/,
    status: false,
  },
  email: {
    regex: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/,
    status: false,
  },
  age: {
    regex: /^(?:[1-9]?\d|1[01]\d|120)$/,
    status: false,
  },
  phone: {
    regex: /^\+20[1-9]\d{9}$/,
    status: false,
  },
  password: {
    regex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
    status: false,
  },
  rePassword: {
    status: false,
  },
};

$(function () {
  fetchData("search.php?s=").then($("#loader").fadeOut());

  toggleNavMenu();

  $("#search-link").on("click", showSearchTab);
  $("#categories-link").on("click", showCategoriesTab);
  $("#area-link").on("click", showAreaTab);
  $("#ingredients-link").on("click", showIngredientsTab);
  $("#contact-link").on("click", showContactTab);

  $("#userName").on("keyup", validateInputs);
  $("#email").on("keyup", validateInputs);
  $("#age").on("keyup", validateInputs);
  $("#phone").on("keyup", validateInputs);
  $("#password").on("keyup", validateInputs);
  $("#rePassword").on("keyup", validateRepassword);
});

function toggleNavMenu() {
  $("#menu-icon").on("click", function () {
    if (parseInt($("nav").css("left"))) {
      $("nav").animate({ left: 0 });
      $(this).html('<i class="fa-solid fa-xmark"></i>');
      for (let i = 0; i < 5; i++) {
        $("#links li")
          .eq(i)
          .animate({ top: 0 }, (i + 5) * 100);
      }
    } else {
      closeNavMenu();
    }
  });
}

function closeNavMenu() {
  $("nav").animate({ left: `-${$("#nav-tab").innerWidth()}` });
  $("#menu-icon").html('<i class="fa-solid fa-bars"></i>');
  $("#links li").animate({ top: "208px" });
}

function showSearchTab() {
  closeNavMenu();

  $("#contact").fadeOut(0);

  $("#search-inputs").fadeIn();

  $("#data").html("");

  $("#name-input").on("keyup", function () {
    fetchData(`search.php?s=${$(this).val()}`);
  });

  $("#first-letter-input").on("keyup", function () {
    if ($(this).val()) {
      fetchData(`search.php?f=${$(this).val()}`);
    }
  });
}

function showCategoriesTab() {
  closeNavMenu();
  $("#search-inputs").fadeOut(0);
  $("#contact").fadeOut(0);
  $("#data").html("");
  fetchData(`categories.php`);
}

function showAreaTab() {
  closeNavMenu();
  $("#search-inputs").fadeOut(0);
  $("#contact").fadeOut(0);
  $("#data").html("");
  fetchData(`list.php?a=list`);
}

function showIngredientsTab() {
  closeNavMenu();
  $("#search-inputs").fadeOut(0);
  $("#contact").fadeOut(0);
  $("#data").html("");
  fetchData(`list.php?i=list`);
}

function showContactTab() {
  closeNavMenu();
  $("#search-inputs").fadeOut(0);
  $("#data").html("");
  $("#contact").fadeIn();
}

async function fetchData(endPoint) {
  $("#loader").fadeIn(100);

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/${endPoint}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (
      endPoint.includes("search.php?s=") ||
      endPoint.includes("search.php?f=") ||
      endPoint.includes("filter.php?c=") ||
      endPoint.includes("filter.php?a=") ||
      endPoint.includes("filter.php?i=")
    ) {
      displayMeals(data);
    } else if (endPoint.includes("lookup.php?i=")) {
      displayMealDetails(data);
    } else if (endPoint.includes("categories.php")) {
      displayCategories(data);
    } else if (endPoint.includes("list.php?a=list")) {
      displayArea(data);
    } else if (endPoint.includes("list.php?i=list")) {
      displayIngredients(data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function displayMeals(data) {
  $("#loader").fadeOut(100);
  if (data.meals) {
    let dataHtml = "";
    data.meals.length = 20;
    data.meals.forEach((meal) => {
      dataHtml += `
      <div onclick='fetchData("lookup.php?i=${meal.idMeal}")' class="w-full sm:w-1/2 md:w-1/4 p-2 cursor-pointer group relative">
        <img class="rounded-md overflow-hidden w-full" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <div class="rounded-md overflow-hidden absolute inset-2 bg-white bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <h2 class="text-3xl text-center px-2 font-bold text-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            ${meal.strMeal}
          </h2>
        </div>
      </div>`;
    });
    $("#data").html(dataHtml);
  }
}

function displayMealDetails(data) {
  function extractRecipes() {
    let htmlMeasures = "";
    for (let i = 1; i <= 20; i++) {
      if (meal[`strMeasure${i}`].trim()) {
        htmlMeasures += `<span class="bg-blue-500 px-2 py-1 text-sm rounded-sm">${
          meal[`strMeasure${i}`]
        }</span>`;
      }
    }
    return htmlMeasures;
  }

  $("#loader").fadeOut(100);
  const meal = data.meals[0];

  $("#data").html(`
    <div class="sm:w-1/3 p-2">
      <img src="${meal.strMealThumb}" alt="${
    meal.strMeal
  }" class="rounded-md overflow-hidden w-full mb-4"/>
      <h2 class="text-4xl text-center font-bold">${meal.strMeal}</h2>
    </div>
    <div class="sm:w-2/3 p-2">
      <h3 class="text-3xl mb-4">Instructions :</h3>
      <p class="mb-4 text-2xl">${meal.strInstructions}</p>
      <h3 class="text-2xl mb-4"><b class="mr-3">Area : </b>${meal.strArea}</h3>
      <h3 class="text-2xl mb-4"><b class="mr-3">Category : </b>${
        meal.strCategory
      }</h3>
      <div class="mb-4">
        <h3 class="text-2xl mb-4 font-bold">Recipes :</h3>
        <div class="flex flex-wrap gap-3">${extractRecipes()}</div>
      </div>
      ${
        meal.strTags
          ? "<h3 class='text-2xl mb-4 flex items-center'><b class='mr-3'>Tags : </b>" +
            meal.strTags
              .split(",")
              .map(
                (str) =>
                  `<span class="bg-pink-500 px-2 py-1 text-sm mr-2 rounded-sm">${str}</span>`
              )
              .join("") +
            "</h3>"
          : ""
      }
      <a href="${
        meal.strSource
      }" target="_blank" class="bg-green-500 px-2 py-1 mr-2 rounded-sm font-bold">Source</a>
      <a href="${
        meal.strYoutube
      }" target="_blank" class="bg-red-500 px-2 py-1 mr-2 rounded-sm font-bold">Youtube</a>
    </div>
  `);
}

function displayCategories(data) {
  $("#loader").fadeOut(100);
  let dataHtml = "";
  data.categories.forEach((category) => {
    dataHtml += `
      <div onclick='fetchData("filter.php?c=${category.strCategory}")' class="w-full sm:w-1/2 md:w-1/4 p-2 cursor-pointer group relative">
        <img class="rounded-md overflow-hidden w-full" src="${category.strCategoryThumb}" alt="${category.strcategory}" />
        <div class="rounded-md overflow-hidden absolute inset-2 bg-white bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <h2 class="text-2xl text-center px-2 font-bold text-black transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            ${category.strCategory}
          </h2>
        </div>
      </div>`;
  });
  $("#data").html(dataHtml);
}

function displayArea(data) {
  $("#loader").fadeOut(100);
  let dataHtml = "";
  data.meals.forEach((area) => {
    dataHtml += `
      <div onclick='fetchData("filter.php?a=${area.strArea}")' class="w-full sm:w-1/2 md:w-1/4 p-2 cursor-pointer group relative">
        <i class="fa-solid fa-location-dot text-center mb-3 block fa-3x"></i>
        <h2 class="text-2xl text-center px-2 font-bold text-white">
          ${area.strArea}
        </h2>
      </div>`;
  });
  $("#data").html(dataHtml);
}

function displayIngredients(data) {
  $("#loader").fadeOut(100);
  let dataHtml = "";
  let ingredients = data.meals;
  ingredients.length = 20;
  ingredients.forEach((ingredient) => {
    dataHtml += `
    <div onclick='fetchData("filter.php?i=${ingredient.strIngredient}")' class="w-full sm:w-1/2 md:w-1/4 p-2 cursor-pointer group relative">
      <i class="fa-solid fa-wheat-awn-circle-exclamation text-center mb-3 block fa-3x"></i>
      <h2 class="text-2xl text-center px-2 font-bold text-white">
        ${ingredient.strIngredient}
      </h2>
    </div>`;
  });
  $("#data").html(dataHtml);
}

function validateInputs(event) {
  let input = event.target;
  if (validateForm[input.id].regex.test(input.value)) {
    input.classList.remove("border-red-500");
    input.classList.add("border-green-500");
    validateForm[input.id].status = true;
    checkFormValidation();
  } else {
    input.classList.remove("border-green-500");
    input.classList.add("border-red-500");
    validateForm[input.id].status = false;
  }
}

function validateRepassword(event) {
  if ($(event.target).val() == $("#password").val()) {
    $("#rePassword").removeClass("border-red-500");
    $("#rePassword").addClass("border-green-500");
    validateForm["rePassword"].status = true;
    checkFormValidation();
  } else {
    $("#rePassword").removeClass("border-green-500");
    $("#rePassword").addClass("border-red-500");
    validateForm["rePassword"].status = false;
  }
}

function checkFormValidation() {
  if (Object.values(validateForm).every((value) => value.status)) {
    $("#submit").prop("disabled", false);
  } else {
    $("#submit").prop("disabled", true);
  }
}
