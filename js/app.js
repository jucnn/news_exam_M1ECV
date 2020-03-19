// Attendre le chargement du DOM

document.addEventListener('DOMContentLoaded', () => {

    // Variables

    const newsApiUrl = 'https://newsapp.dwsapp.io/api/';

    // Variables DOM

    const searchForm = document.querySelector('#searchForm');
    const searchKeywordForm = document.querySelector('#searchKeywordData');
    const newsList = document.querySelector('#newsList');
    const searchSourceData = document.querySelector('#searchSourceData');
    const searchKeywordData = document.querySelector('#searchKeywordData');

    // Functions

    const displayNewsList = liste => {
        searchSourceData.value = '';
        searchKeywordData.value = '';

        newsList.innerHTML = '';

        for (let i = 0; i < liste.length; i++) {
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
            `
        }
    }

    const getFormSubmit = () => {

        searchForm.addEventListener("submit", event => {
            event.preventDefault();

            if (searchSourceData.value.length > 0 && searchKeywordData.value.length === 0) {
                new FETCHrequest(`${newsApiUrl}news/${searchSourceData.value}/null`, 'GET')
                    .fetch()
                    .then(fetchData => {
                        displayNewsList(fetchData.data.articles)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else if (searchSourceData.value.length > 0 && searchKeywordData.value.length > 0) {
                new FETCHrequest(`${newsApiUrl}news/${searchSourceData.value}/${searchKeywordData.value}`, 'GET')
                    .fetch()
                    .then(fetchData => {
                        displayNewsList(fetchData.data.articles)
                    })
                    .catch(fetchError => {
                        console.log(fetchError)
                    })
            } else {
                console.log("error");
            }
        })
    }

    getFormSubmit();


})