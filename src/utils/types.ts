// Types declaration
export type Command = "ibox" | "digimap" | "all";

export type Store = "ibox" | "digimap";

export type Url<T> = {[store in Store] : T};

export type DigimapCheckProductType = {
    product_code:string;
    quantity:number;
    store_code?:null;
    store_group_code?:null;
}