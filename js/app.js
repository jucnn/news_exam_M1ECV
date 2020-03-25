// Attendre le chargement du DOM

document.addEventListener('DOMContentLoaded', () => {

    // Variables

    const newsApiUrl = 'https://newsapp.dwsapp.io/api';
    const localSt = 'userId';
    const newsApiToken = "d169b13a24fb4632bdaf82d99bc1b99f";

    // Variables Search

    const searchForm = document.querySelector('#searchForm');
    const searchButton = document.querySelector('#searchButton');
    const newsList = document.querySelector('#newsList');
    const searchSourceData = document.querySelector('#searchSourceData');
    const searchKeywordData = document.querySelector('#searchKeywordData');
    const titleResearch = document.querySelector('#titleResearch');

    // Variables Login & Register
    const registerForm = document.querySelector('#registerForm');
    const userEmail = document.querySelector('[name="userEmail"]');
    const userPassword = document.querySelector('[name="userPassword"]');
    const userFirstname = document.querySelector('[name="userFirstname"]');

    const userLastname = document.querySelector('[name="userLastname"]');
    const loginForm = document.querySelector('#loginForm');
    const loginEmail = document.querySelector('[name="loginEmail"]');
    const loginPassword = document.querySelector('[name="loginPassword"]');

    const userNav = document.querySelector("header nav")

    //Favorite
    const favoriteList = document.querySelector("#favoriteList");
    const favoriteButton = document.querySelector("#favoriteButton");

    //// Functions

    // set many attributes to one element
    function setAttributes(el, attrs) {
        for (var key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }

    const getSource = () => {
        new FETCHrequest(`${newsApiUrl}/news/sources`, 'POST', {
                news_api_token: newsApiToken
            })
            .fetch()
            .then(fetchData => {
                displaySourceOptions(fetchData.data.sources)
            })
            .catch(fetchError => {
                console.log(fetchError)
            })
    }

    getSource();

    // display source + give all elmts to favorite button
    const displaySourceOptions = liste => {

        for (let i = 0; i < liste.length; i++) {
            searchSourceData.innerHTML += `
                    <option news-id="${liste[i].id}" news-name="${liste[i].name}" news-description="${liste[i].description}" news-url="${liste[i].url}" news-category="${liste[i].category}" news-language="${liste[i].language}" news-country="${liste[i].country}" value="${liste[i].id}">${liste[i].name}</option>
            `
        }

        searchSourceData.addEventListener('change', function () {
            var selectedOption = searchSourceData.options[searchSourceData.selectedIndex];
            favoriteButton.innerHTML = `Add ${selectedOption.getAttribute('news-name')} to your bookmarks`;

            // console.log(selectedOption.getAttribute('news-url'));
            setAttributes(favoriteButton, {
                "add-news-id": selectedOption.getAttribute('news-id'),
                "add-news-name": selectedOption.getAttribute('news-name'),
                "add-news-description": selectedOption.getAttribute('news-description'),
                "add-news-url": selectedOption.getAttribute('news-url'),
                "add-news-category": selectedOption.getAttribute('news-category'),
                "add-news-language": selectedOption.getAttribute('news-language'),
                "add-news-country": selectedOption.getAttribute('news-country')
            });


            const dataFavorite = {
                id: favoriteButton.getAttribute('add-news-id'),
                name: favoriteButton.getAttribute('add-news-name'),
                description: favoriteButton.getAttribute('add-news-description'),
                url: favoriteButton.getAttribute('add-news-url'),
                category: favoriteButton.getAttribute('add-news-category'),
                language: favoriteButton.getAttribute('add-news-language'),
                country: favoriteButton.getAttribute('add-news-country'),
            };


            addFavorite(favoriteButton, dataFavorite);
        })


        // addFavorite(favoriteButton);
    }

    const addFavorite = (button, data) => {
        button.addEventListener('click', event => {
            event.preventDefault()
            new FETCHrequest(`${newsApiUrl}/bookmark/`, 'POST', {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    url: data.url,
                    category: data.category,
                    language: data.language,
                    country: data.country,
                    token: localStorage.getItem(localSt),
                })
                .fetch()
                .then(fetchData => {
                    console.log(fetchData);
                    displayFavorite(fetchData.data.data);
                    // checkUserToken('favorite')
                })
                .catch(fetchError => {
                    console.log(fetchError);
                    // displayError(fetchError.message)
                })
        })
    }

    const displayFavorite = data => {

        favoriteList.innerHTML += `
                    <li>
                        <span news-id="${data._id}">${data.name}</span>
                        <button class="deleteFavoriteButton">Delete</button>

                    </li>
                `;

        deleteFavorite(document.querySelectorAll('.deleteFavoriteButton'));

    }

    const deleteFavorite = favorites => {
        for (let item of favorites) {
            item.addEventListener('click', () => {
                new FETCHrequest(`${newsApiUrl}/bookmark/${item.getAttribute('news-id')}`, 'DELETE', {
                        token: localStorage.getItem(localSt),
                    })
                    .fetch()
                    .then(fetchData => console.log(fetchData))
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            })
        }
    }



    const displayTitleResearch = title => {
        titleResearch.innerHTML = `
        ${title.totalResults} results for ${searchSourceData.value} and ${searchKeywordData.value}
        `

    }

    const displayNewsList = liste => {
        searchSourceData.value = '';
        searchKeywordData.value = '';

        newsList.innerHTML = '';

        for (let i = 0; i < 10; i++) {
            newsList.innerHTML += `
                    <article>
                        <span>${liste[i].author}</span>
                        <figure>
                            <img src="${liste[i].urlToImage}" alt="${liste[i].title}">
                            <figcaption movie-id="${liste[i].id}">${liste[i].title}</figcaption>
                        </figure>
                        <p>${liste[i].description}</p>
                        <a href="${liste[i].url}">Voir l'article</a>
                    </article>
            `;
        }
    }

    const checkUserToken = () => {
        new FETCHrequest(
                `${newsApiUrl}/me`,
                'POST', {
                    token: localStorage.getItem(localSt)
                }
            )
            .fetch()
            .then(fetchData => {
                // console.log(fetchData);

                displayNav(fetchData.data.user.firstname);

                registerForm.classList.add('hidden');
                loginForm.classList.add('hidden');

                getFormSubmit();

            })
            .catch(fetchError => {
                console.log(fetchError);
            })
    }

    const getFormSubmit = () => {

        searchButton.addEventListener("click", event => {
            event.preventDefault();
            if (searchSourceData.value.length > 0 && searchKeywordData.value.length === 0) {
                new FETCHrequest(`${newsApiUrl}/news/${searchSourceData.value}/null`, 'POST', {
                        news_api_token: newsApiToken
                    })
                    .fetch()
                    .then(fetchData => {
                        displayTitleResearch(fetchData.data);
                        displayNewsList(fetchData.data.articles)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else if (searchSourceData.value.length > 0 && searchKeywordData.value.length > 0) {
                new FETCHrequest(`${newsApiUrl}/news/${searchSourceData.value}/${searchKeywordData.value}`, 'POST', {
                        news_api_token: newsApiToken
                    })
                    .fetch()
                    .then(fetchData => {
                        displayTitleResearch(fetchData.data);
                        displayNewsList(fetchData.data.articles)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else {
                console.log("error");
            }
        });

        registerForm.addEventListener('submit', event => {
            event.preventDefault();

            let formError = 0;

            if (userEmail.value.length < 5) {
                formError++
            };
            if (userPassword.value.length < 5) {
                formError++
            };
            if (userFirstname.value.length < 2) {
                formError++
            };
            if (userLastname.value.length < 2) {
                formError++
            };

            if (formError === 0) {
                new FETCHrequest(`${newsApiUrl}/register`, 'POST', {
                        email: userEmail.value,
                        password: userPassword.value,
                        firstname: userFirstname.value,
                        lastname: userLastname.value
                    })
                    .fetch()
                    .then(fetchData => {
                        console.log(fetchData)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else {
                displayError('Check mandatory fields')
            }
        });

        loginForm.addEventListener('submit', event => {
            // Stop event propagation
            event.preventDefault();

            // Check form data
            let formError = 0;

            if (loginEmail.value.length < 5) {
                formError++
            };
            if (loginPassword.value.length < 5) {
                formError++
            };

            if (formError === 0) {
                new FETCHrequest(`${newsApiUrl}/login`, 'POST', {
                        email: loginEmail.value,
                        password: loginPassword.value
                    })
                    .fetch()
                    .then(fetchData => {
                        console.log(fetchData.data.token);

                        localStorage.setItem(localSt, fetchData.data.token);
                        checkUserToken();
                    })
                    .catch(fetchError => {
                        console.log(fetchError);
                    })
            } else {
                displayError('Check mandatory fields')
            }
        });
    }

    const displayNav = name => {
        userNav.innerHTML = `
                <h2>Hello ${name}</h2>
                <button id="logoutBtn">Log out</button>
            `;

        userNav.classList.remove('hidden');
        favoriteList.classList.remove('hidden');


        document.querySelector('#logoutBtn').addEventListener('click', () => {
            // Delete LocalStorage
            localStorage.removeItem(localSt);
            userNav.innerHTML = '';
            favoriteList.innerHTML = '';
            registerForm.classList.remove('hidden');
            loginForm.classList.remove('hidden');
            searchForm.classList.remove('open');
        })
    }

    //Favori

    //check if user is connected
    if (localStorage.getItem(localSt) !== null) {
        console.log(localStorage.getItem(localSt))
        checkUserToken();

    } else {
        getFormSubmit();
    };
})