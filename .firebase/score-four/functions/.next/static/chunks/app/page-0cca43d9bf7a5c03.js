(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{9502:function(e,n,t){Promise.resolve().then(t.bind(t,4100))},4100:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return a}});var s=t(7437);function a(){let e=async()=>{let e=await fetch("/api",{method:"POST",body:JSON.stringify({message:{type:"new-game"},sender:"player"})}),n=await e.json(),{gameId:t}=n;console.log(t),location.href="/".concat(t)};return(0,s.jsx)("main",{className:"flex min-h-screen flex-col items-center justify-between p-24",children:(0,s.jsx)("div",{className:"relative",children:(0,s.jsx)("button",{className:"text-xl absolute top-1/2 p-1 border-2 rounded hover:opacity-50",style:{right:"-130px",transform:"translateY(-50%)"},onClick:e,children:"New Game"})})})}t(6691)}},function(e){e.O(0,[986,971,864,744],function(){return e(e.s=9502)}),_N_E=e.O()}]);