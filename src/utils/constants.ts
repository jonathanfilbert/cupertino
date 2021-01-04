import {Url} from './types'

// Constants Declaration
export const STORES = ["ibox", "digimap", "all"]

export const DIGIMAP_PB_CODE = "appmgmn3id-a"
export const DIGIMAP_GR_CODE = "appmgmk3id-a"


export const PB_URL:Url<string> = {
    "ibox": "https://prod-dot-eraspace-252803.appspot.com/api/v1/products/iphone-12-pro-128gb-pacific-blue",
    "digimap":"https://api.lumen.id/commerce/v1/product/inventory/get",
}

export const G_URL:Url<string> = {
    "ibox":"https://prod-dot-eraspace-252803.appspot.com/api/v1/products/iphone-12-pro-128gb-graphite",
    "digimap": PB_URL.digimap
}