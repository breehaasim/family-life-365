import {useEffect,useRef,useState} from 'react';
const once=(r,cb)=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){cb();o.disconnect()}},{threshold:.2});o.observe(r.current);return()=>o.disconnect()};
export function Reveal({children,delay=0,className='',as:T='div'}){const r=useRef();const [v,setV]=useState(false);useEffect(()=>once(r,()=>setV(true)),[]);
return <T ref={r} className={`rv ${v?'in':''} ${className}`} style={{transitionDelay:delay+'ms'}}>{children}</T>}
export function Words({text,as:T='h2',className='',delay=0,on}){const r=useRef();const [v,setV]=useState(false);useEffect(()=>{if(on===undefined)return once(r,()=>setV(true))},[on]);
return <T ref={r} className={`words ${className} ${(on===undefined?v:on)?'in':''}`} aria-label={text}>{text.split(' ').map((w,i)=><span key={i} className="w" aria-hidden="true"><span style={{transitionDelay:delay+i*80+'ms'}}>{w}</span></span>)}</T>}
export function Img({src,fb,alt='',className='',style}){const [s,setS]=useState(src);const [bad,setBad]=useState(false);
useEffect(()=>{setS(src);setBad(false)},[src]);const err=()=>{if(fb&&s!==fb)setS(fb);else setBad(true)};
return bad?<div className={`ph ${className}`} role="img" aria-label={alt}/>:<img className={className} style={style} src={s} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={err}/>}
export function Btn({children,href,onClick,ghost,small,...p}){const C=href?'a':'button';return <C className={`btn ${ghost?'ghost':''} ${small?'sm':''}`} href={href} onClick={onClick} {...p}><span>{children}</span><i aria-hidden="true">→</i></C>}
export function useProgress(cb){const r=useRef();useEffect(()=>{const f=()=>{const b=r.current.getBoundingClientRect();const p=Math.min(1,Math.max(0,-b.top/(b.height-innerHeight)));r.current.style.setProperty('--p',p);cb&&cb(p)};f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);return r}
