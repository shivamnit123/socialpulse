///  it is very important to understand that what is the problem when we pass props from one component to other .. like in post we pass post id
// from one page to other page or component...so the problem is here when there is any change in particular component b/c of props
// then all components is rendered....jo ki nhi honi chahiye----so thats why we create a global post ------

import { atom } from "recoil";

const postsAtom = atom({
    key: "postsAtom",
    default: [],   // post me hmsha  data array ke form me aayenge thats why here bydefault empty arry of objects likha hai-----
});

export default postsAtom;