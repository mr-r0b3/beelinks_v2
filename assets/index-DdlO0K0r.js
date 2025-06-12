(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function o(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=o(a);fetch(a.href,n)}})();const I=t=>{try{const e=new URL(t);return e.protocol==="http:"||e.protocol==="https:"}catch{return!1}},x=t=>{const e=t.toLowerCase(),o={"github.com":"fab fa-github","linkedin.com":"fab fa-linkedin","twitter.com":"fab fa-twitter","instagram.com":"fab fa-instagram","youtube.com":"fab fa-youtube","facebook.com":"fab fa-facebook","tiktok.com":"fab fa-tiktok","discord.com":"fab fa-discord","telegram.org":"fab fa-telegram","whatsapp.com":"fab fa-whatsapp","behance.net":"fab fa-behance","dribbble.com":"fab fa-dribbble","pinterest.com":"fab fa-pinterest","medium.com":"fab fa-medium","dev.to":"fab fa-dev","stackoverflow.com":"fab fa-stack-overflow","codepen.io":"fab fa-codepen","twitch.tv":"fab fa-twitch"};for(const[s,a]of Object.entries(o))if(e.includes(s))return a;return e.includes("blog")||e.includes("medium")?"fas fa-blog":e.includes("shop")||e.includes("store")?"fas fa-shopping-cart":e.includes("music")||e.includes("spotify")?"fas fa-music":e.includes("video")||e.includes("vimeo")?"fas fa-video":e.includes("photo")||e.includes("image")?"fas fa-camera":e.includes("mail")||e.includes("email")?"fas fa-envelope":e.includes("phone")||e.includes("contact")?"fas fa-phone":"fas fa-link"},D=[{name:"Unsplash",baseUrl:"https://source.unsplash.com",sizes:["200x200","300x300","400x400"],categories:["person","portrait","face","people","business","professional"]},{name:"Picsum",baseUrl:"https://picsum.photos",sizes:["200","300","400"],categories:["seed"]},{name:"UI Avatars",baseUrl:"https://ui-avatars.com/api",sizes:["200","300","400"],categories:["initials"]}],F=()=>{const t=D[0],e=t.sizes[Math.floor(Math.random()*t.sizes.length)],o=t.categories[Math.floor(Math.random()*t.categories.length)],s=Math.floor(Math.random()*1e4)+Date.now();return`${t.baseUrl}/${e}/?${o}&sig=${s}`},P=()=>{const t=["Alex+Johnson","Maria+Silva","John+Doe","Ana+Costa","Mike+Brown","Sofia+Santos","David+Wilson","Lucia+Oliveira","Chris+Davis","Julia+Lima","Ryan+Miller","Camila+Ferreira","Kevin+Garcia","Beatriz+Alves","Tyler+Jones","Carla+Rocha","Jason+Martinez","Fernanda+Gomes","Brandon+Taylor","Mariana+Souza"],e=["FFD700","FFC107","FF9800","F44336","9C27B0","3F51B5","2196F3","00BCD4","009688","4CAF50"],o=["1A1A1A","FFFFFF","000000","333333"],s=t[Math.floor(Math.random()*t.length)],a=e[Math.floor(Math.random()*e.length)],n=o[Math.floor(Math.random()*o.length)],r=200+Math.floor(Math.random()*200),i=Math.floor(Math.random()*1e4)+Date.now();return`https://ui-avatars.com/api/?name=${s}&background=${a}&color=${n}&bold=true&size=${r}&v=${i}`},b=()=>Math.random()>.3?F():P(),c={LINKS:"beelinks_links",PROFILE:"beelinks_profile",THEME:"beelinks_theme",STATS:"beelinks_stats"},m=(t,e)=>{try{return localStorage.setItem(t,JSON.stringify(e)),{success:!0}}catch(o){return{success:!1,error:o.message}}},h=(t,e=null)=>{try{const o=localStorage.getItem(t);return o?JSON.parse(o):e}catch(o){return console.error(`Erro ao carregar ${t}:`,o),e}},p=t=>m(c.LINKS,t),l=()=>h(c.LINKS,[]),L=t=>m(c.PROFILE,t),w=()=>{const t={username:"seuusuario",bio:"Desenvolvedor | Criador de Conteúdo | Tech Enthusiast",avatar:b(),views:0,totalClicks:0},e=h(c.PROFILE,t);return e.avatar=b(),L(e),e},$=t=>m(c.THEME,t),S=()=>h(c.THEME,"dark"),E=t=>m(c.STATS,t),k=()=>h(c.STATS,{totalViews:1200,totalClicks:234,linksCreated:0,lastVisit:new Date().toISOString()}),d=(t,e,o,s="fas fa-link")=>({id:crypto.randomUUID(),title:t.trim(),url:e.trim(),description:o.trim(),icon:s,createdAt:new Date().toISOString(),clicks:0}),q=t=>({...t,clicks:t.clicks+1}),A=t=>{const e=[];return(!t.title||t.title.length<2)&&e.push("Título deve ter pelo menos 2 caracteres"),(!t.url||!B(t.url))&&e.push("URL deve ser válida"),(!t.description||t.description.length<5)&&e.push("Descrição deve ter pelo menos 5 caracteres"),{isValid:e.length===0,errors:e}},B=t=>{try{const e=new URL(t);return e.protocol==="http:"||e.protocol==="https:"}catch{return!1}},N=t=>[...t].sort((e,o)=>new Date(o.createdAt)-new Date(e.createdAt)),O=t=>`
  <div class="relative group">
    <a href="${t.url}" 
       target="_blank" 
       data-link-id="${t.id}"
       class="link-item block dark:bg-bee-gray bg-bee-white hover:bg-bee-yellow hover:text-bee-black transition-all duration-300 rounded-xl p-4 border-2 border-transparent hover:border-bee-yellow group shadow-md">
      <div class="flex items-center space-x-4">
        <div class="bg-bee-yellow text-bee-black p-3 rounded-lg group-hover:bg-bee-black group-hover:text-bee-yellow transition-colors duration-300">
          <i class="${t.icon} text-xl"></i>
        </div>
        <div class="flex-1">
          <h3 class="dark:text-white text-bee-black group-hover:text-bee-black font-semibold text-lg">${t.title}</h3>
          <p class="dark:text-gray-400 text-gray-500 group-hover:text-bee-gray text-sm">${t.description}</p>
          ${t.clicks>0?`<small class="text-xs text-gray-500">${t.clicks} cliques</small>`:""}
        </div>
        <i class="fas fa-external-link-alt dark:text-gray-400 text-gray-500 group-hover:text-bee-black"></i>
      </div>
    </a>
    <button 
      data-delete-id="${t.id}"
      class="delete-link-btn absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
      title="Remover link">
      <i class="fas fa-trash text-sm"></i>
    </button>
  </div>
`,g=()=>{const t=document.querySelector("#linksContainer");if(!t)return;const e=l(),o=N(e);if(o.length===0){t.innerHTML=`
      <div class="text-center py-8">
        <i class="fas fa-link text-4xl text-gray-400 mb-4"></i>
        <p class="dark:text-gray-400 text-gray-500">Nenhum link adicionado ainda</p>
        <p class="dark:text-gray-500 text-gray-600 text-sm">Clique em "Adicionar Link" para começar</p>
      </div>
    `;return}t.innerHTML=o.map(O).join(""),z()},z=()=>{document.querySelectorAll("[data-link-id]").forEach(e=>{e.addEventListener("click",o=>{const s=e.dataset.linkId;U(s)})})},U=t=>{const o=l().map(s=>s.id===t?q(s):s);p(o),R()},R=()=>{const t=k(),e=l(),o=e.reduce((a,n)=>a+n.clicks,0),s={...t,totalClicks:o,linksCreated:e.length,lastVisit:new Date().toISOString()};E(s),v()},v=()=>{const t=k(),e=document.querySelector("#statsContainer");e&&(e.innerHTML=`
      <span><i class="fas fa-eye mr-1"></i>${t.totalViews.toLocaleString()} visualizações</span>
      <span><i class="fas fa-mouse-pointer mr-1"></i>${t.totalClicks} cliques</span>
    `)},H=()=>{const t=w(),e=document.querySelector("#profileContainer");if(e){e.innerHTML=`
      <div class="relative inline-block mb-4">
        <img src="${t.avatar}" 
             alt="Profile Picture" 
             class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-bee-yellow shadow-lg mx-auto object-cover">        <button id="refreshPhoto" 
                class="absolute -top-2 -right-2 bg-bee-yellow hover:bg-bee-dark-yellow text-bee-black rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110" 
                title="Gerar nova foto aleatória">
          <i class="fas fa-sync-alt text-sm"></i>
        </button>
      </div>
      <h2 class="dark:text-white text-bee-black text-xl sm:text-2xl font-semibold mb-2">@${t.username}</h2>
      <p class="dark:text-gray-300 text-gray-600 text-sm sm:text-base mb-4">${t.bio}</p>
    `;const o=document.querySelector("#refreshPhoto");o&&o.addEventListener("click",V)}},V=()=>{const t=w(),e=b(),o={...t,avatar:e};L(o);const s=document.querySelector("#profileContainer img");if(s){const a=document.querySelector("#refreshPhoto i");a&&a.classList.add("fa-spin"),setTimeout(()=>{s.src=e,a&&a.classList.remove("fa-spin"),s.style.opacity="0",setTimeout(()=>{var n;s.style.transition="opacity 0.3s ease",s.style.opacity="1",typeof((n=window.BeeLinks)==null?void 0:n.showNotification)=="function"&&window.BeeLinks.showNotification("🎨 Nova foto de perfil gerada!")},100)},500)}},M=()=>{const t=document.documentElement,o=S()==="dark"?"light":"dark";o==="dark"?t.classList.add("dark"):t.classList.remove("dark");const s=document.querySelector("#themeIcon");return s&&(s.className=o==="dark"?"fas fa-moon text-lg":"fas fa-sun text-lg"),$(o),o},j=()=>{const t=S(),e=document.documentElement,o=document.querySelector("#themeIcon");t==="dark"?(e.classList.add("dark"),o&&(o.className="fas fa-moon text-lg")):(e.classList.remove("dark"),o&&(o.className="fas fa-sun text-lg"))},_=()=>{const t=document.querySelector("#addLinkBtn"),e=document.querySelector("#addLinkModal"),o=document.querySelector("#closeModal"),s=document.querySelector("#cancelBtn"),a=document.querySelector("#linkForm");t&&e&&t.addEventListener("click",()=>{e.classList.remove("hidden"),document.body.style.overflow="hidden"});const n=()=>{e&&(e.classList.add("hidden"),document.body.style.overflow="auto",a&&a.reset())};o&&o.addEventListener("click",n),s&&s.addEventListener("click",n),e&&e.addEventListener("click",r=>{r.target===e&&n()})},f=(t,e="success")=>{const o=document.createElement("div");o.className=`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${e==="success"?"bg-green-500 text-white":"bg-red-500 text-white"}`,o.innerHTML=`
    <div class="flex items-center space-x-2">
      <i class="fas ${e==="success"?"fa-check-circle":"fa-exclamation-circle"}"></i>
      <span>${t}</span>
    </div>
  `,document.body.appendChild(o),setTimeout(()=>{o.classList.remove("translate-x-full")},100),setTimeout(()=>{o.classList.add("translate-x-full"),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300)},3e3)};let u={links:[]};const J=()=>{console.log("🐝 Inicializando BeeLinks..."),u.links=l(),j(),H(),v(),g(),K(),C(),console.log("✅ BeeLinks inicializado com sucesso!")},K=()=>{const t=document.querySelector("#themeToggle");t&&t.addEventListener("click",()=>{const e=M();f(`Tema ${e==="dark"?"escuro":"claro"} ativado!`)}),_(),G(),Y(),Q()},G=()=>{const t=document.querySelector("#linkForm");t&&t.addEventListener("submit",e=>{e.preventDefault(),T(e)})},T=t=>{const e=new FormData(t.target),o=e.get("title"),s=e.get("url"),a=e.get("description"),n=e.get("icon")||x(s),r=d(o,s,a,n),i=A(r);if(!i.isValid){f(i.errors.join(", "),"error");return}u.links=[r,...u.links],p(u.links),g();const y=document.querySelector("#addLinkModal");y&&(y.classList.add("hidden"),document.body.style.overflow="auto"),t.target.reset(),f("Link adicionado com sucesso!")},Y=()=>{const t=document.querySelector("#urlInput"),e=document.querySelector("#iconPreview");t&&e&&t.addEventListener("input",o=>{const s=o.target.value;if(I(s)){const a=x(s);e.className=a+" text-xl",e.parentElement.classList.remove("hidden")}else e.parentElement.classList.add("hidden")})},C=()=>{const t=k(),e={...t,totalViews:t.totalViews+1,lastVisit:new Date().toISOString()};E(e),v()},W=()=>{if(l().length===0){const e=[d("GitHub","https://github.com","Confira meus projetos","fab fa-github"),d("LinkedIn","https://linkedin.com","Conecte-se comigo","fab fa-linkedin"),d("Portfólio","https://meuportfolio.com","Veja meu trabalho","fas fa-globe"),d("YouTube","https://youtube.com","Tutoriais e conteúdo","fab fa-youtube"),d("Instagram","https://instagram.com","Acompanhe meu dia a dia","fab fa-instagram")];p(e),u.links=e}};document.addEventListener("DOMContentLoaded",()=>{W(),J()});window.BeeLinks={addLink:T,toggleTheme:M,renderLinks:g,showNotification:f};const Q=()=>{const t=document.querySelector("#linksContainer");t&&t.addEventListener("click",e=>{const o=e.target.closest("[data-delete-id]");if(o){e.preventDefault(),e.stopPropagation();const s=o.dataset.deleteId;X(s)}})},X=t=>{const o=l().find(s=>s.id===t);if(!o){f("Link não encontrado!","error");return}Z(t,o)},Z=(t,e)=>{const o=document.createElement("div");o.className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in",o.innerHTML=`
    <div class="bg-white dark:bg-bee-gray rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-95 animate-scale-in">
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <i class="fas fa-trash text-red-600 dark:text-red-400 text-xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmar exclusão</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          Tem certeza que deseja remover o link:
        </p>
        <p class="font-semibold text-bee-yellow mb-4">"${e.title}"</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
        
        <div class="flex justify-center space-x-3">
          <button id="cancelDelete" 
                  class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200">
            <i class="fas fa-times mr-2"></i>Cancelar
          </button>
          <button id="confirmDelete" 
                  class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
            <i class="fas fa-trash mr-2"></i>Remover
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(o),document.body.style.overflow="hidden";const s=o.querySelector("#cancelDelete"),a=o.querySelector("#confirmDelete"),n=()=>{document.body.removeChild(o),document.body.style.overflow="auto"};s.addEventListener("click",n),a.addEventListener("click",()=>{ee(t,e.title),n()}),o.addEventListener("click",i=>{i.target===o&&n()});const r=i=>{i.key==="Escape"&&(n(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)},ee=(t,e)=>{const s=l().filter(a=>a.id!==t);p(s),u.links=s,g(),C(),f(`✅ Link "${e}" removido com sucesso!`,"success"),console.log(`🗑️ Link "${e}" removido com sucesso!`)};
