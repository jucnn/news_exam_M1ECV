// Attendre le chargement du DOM

document.addEventListener('DOMContentLoaded', () => {

    // Variables

    const newsApiUrl = 'https://newsapp.dwsapp.io/api';
    const localSt = 'userId';

    // Variables Search

    const searchForm = document.querySelector('#searchForm');
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

    // Functions


    const displaySourceOptions = liste => {
        for (let i = 0; i < liste.length; i++) {
            searchSourceData.innerHTML += `
                    <option value="${liste[i].id}">${liste[i].name}</option>
            `
        }
    }

    const getSource = () => {
        new FETCHrequest(`${newsApiUrl}/news/sources`, 'GET')
            .fetch()
            .then(fetchData => {
                displaySourceOptions(fetchData.data.sources)
            })
            .catch(fetchError => {
                console.log(fetchError)
            })
    }

    getSource();

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
                        <button id="favoriteButton">Add ${liste[i].source.name} to favorite</button>
                    </article>
            `;
            addFavorite(document.querySelector('#favoriteButton'), liste[i]);
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
                console.log(fetchData);

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

        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            if (searchSourceData.value.length > 0 && searchKeywordData.value.length === 0) {
                new FETCHrequest(`${newsApiUrl}/news/${searchSourceData.value}/null`, 'GET')
                    .fetch()
                    .then(fetchData => {
                        displayTitleResearch(fetchData.data);
                        displayNewsList(fetchData.data.articles)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else if (searchSourceData.value.length > 0 && searchKeywordData.value.length > 0) {
                new FETCHrequest(`${newsApiUrl}/news/${searchSourceData.value}/${searchKeywordData.value}`, 'GET')
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
                <h1>Hello ${name}</h1>
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

    const addFavorite = (button, data) => {
        button.addEventListener('click', () => {
            new FETCHrequest(`${newsApiUrl}/bookmark/`, 'POST', {
                    id: data.source.id,
                    name: data.source.name,
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
                    // checkUserToken('favorite')
                })
                .catch(fetchError => {
                    displayError(fetchError.message)
                })
        })
    }

    //check if user is connected
    if (localStorage.getItem(localSt) !== null) {
        console.log(localStorage.getItem(localSt))
        checkUserToken();

    } else {
        getFormSubmit();
    };
})