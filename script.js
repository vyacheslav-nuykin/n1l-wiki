const API_BASE = 'https://api.n1l.ru/v1/wiki';

let wikiData = null;

async function loadWiki() {
    try {
        const response = await fetch(`${API_BASE}/index.json`);
        wikiData = await response.json();
        renderNavigation();

        const hash = window.location.hash.slice(1);
        if (hash) {
            const [category, slug] = hash.split('/');
            loadPage(category, slug);
        }
    } catch (error) {
        document.getElementById('nav').innerHTML = '<div class="loading-nav">ошибка загрузки :(</div>';
        console.error(error);
    }
}

function renderNavigation() {
    const nav = document.getElementById('nav');
    nav.innerHTML = '';
    
    wikiData.categories.forEach(cat => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerHTML = `${cat.title} <span style="font-size:0.7rem;">▼</span>`;
        
        const pagesList = document.createElement('ul');
        pagesList.className = 'pages';
        
        cat.pages.forEach(page => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = page.title;
            a.onclick = (e) => {
                e.preventDefault();
                loadPage(cat.title, page.slug);
                window.location.hash = `${cat.title}/${page.slug}`;
            };
            li.appendChild(a);
            pagesList.appendChild(li);
        });
        
        categoryDiv.appendChild(title);
        categoryDiv.appendChild(pagesList);
        nav.appendChild(categoryDiv);

        title.onclick = () => {
            pagesList.style.display = pagesList.style.display === 'none' ? 'block' : 'none';
            title.innerHTML = `${cat.title} <span style="font-size:0.7rem;">${pagesList.style.display === 'none' ? '▶' : '▼'}</span>`;
        };
    });
}

async function loadPage(category, slug) {
    const contentDiv = document.getElementById('page-content');
    contentDiv.innerHTML = '<div class="loading-page">загрузка...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/pages/${category}/${slug}.json`);
        if (!response.ok) throw new Error('Page not found');
        const page = await response.json();
        
        const html = marked.parse(page.content);
        contentDiv.innerHTML = `
            <h1>${page.title}</h1>
            <div class="meta" style="color:#4682dc; font-size:0.8rem; margin-bottom:1rem;">
                обновлено: ${page.updated}
            </div>
            <div class="markdown-body">${html}</div>
        `;
    } catch (error) {
        contentDiv.innerHTML = '<div class="loading-page">статья не найдена :(</div>';
    }
}

loadWiki();
