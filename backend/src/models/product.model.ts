export class Product{
    id?: number;
    category?: string;
    productName?: string;
    price?: number;

    constructor(id?: number, category?: string, productName?: string, price?: number){
        if(id !==null) this.id = id;
        if(category !==null) this.category = category;
        if(productName !==null) this.productName = productName;
        if(price !==null) this.price = price;
    }
}