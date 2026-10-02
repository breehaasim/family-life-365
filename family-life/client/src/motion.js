import {useEffect} from 'react';
const T='main p,main h3,main small,main figcaption,main blockquote,main .faq button,main .lab,footer h2,footer h3,footer p,footer a,footer small';
const M='main .hexw,main .sn,main .step i,main .hs i,main .tq,main .faq,main .form,main .tform,main .vals span,main .gal figure';
const EX='.words,.hc,.chat,.nav,.ht,.stx';
export default function useMotion(){useEffect(()=>{
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tin');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
const scan=()=>document.querySelectorAll(T+','+M).forEach(el=>{if(el.dataset.tm)return;const media=el.matches(M);if(!media&&el.closest(EX))return;el.dataset.tm=1;el.classList.add(media?'mm':'tm');
const sib=[...el.parentElement.children].filter(c=>c.tagName===el.tagName);el.style.setProperty('--td',Math.min(sib.indexOf(el),6)*90+'ms');io.observe(el)});
scan();const mo=new MutationObserver(scan);mo.observe(document.getElementById('root'),{childList:true,subtree:true});
const par=()=>document.querySelectorAll('[data-par]').forEach(el=>{const b=el.parentElement.getBoundingClientRect();el.style.transform=`translateY(${(b.top+b.height/2-innerHeight/2)*-0.08}px)`});
par();addEventListener('scroll',par,{passive:true});
return()=>{io.disconnect();mo.disconnect();removeEventListener('scroll',par)}},[])}
