import React from 'react';import {createRoot} from 'react-dom/client';
const root=createRoot(document.getElementById('root'));
if(location.pathname.startsWith('/admin')){ // admin panel (separate bundle, separate styles)
  import('./admin/Admin.jsx').then(m=>root.render(<m.default/>));
}else{ // public website: load content from database first, then render
  Promise.all([import('./App.jsx'),import('./styles.css'),import('./content.js').then(m=>m.loadContent())]).then(([a])=>root.render(<a.default/>));
}
