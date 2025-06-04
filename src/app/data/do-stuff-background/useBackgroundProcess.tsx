// "use client"
// import React, { useEffect } from 'react'

// const useBackgroundProcess = () => {
//     useEffect(()=>{
//         const handler =()=>{
//             const dataFromLocalStorage:string[]=JSON.parse(localStorage.getItem("updateToLocalStorage")||"[]")
//             if(dataFromLocalStorage.length>0){
//                 navigator.sendBeacon("/api/studyLater")
//             }
//         }
//     })
//   return (
//     <div>useBackgroundProcess</div>
//   )
// }

// export default useBackgroundProcess