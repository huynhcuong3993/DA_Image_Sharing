import { IsNotEmpty , IsNumber, MinLength } from "class-validator";

export class productDTO{
    @IsNotEmpty()
    category_id?: string;
    @MinLength(5,{message: "Please enter a valid product name"})
    productName?: string;
    @IsNumber()
    price?: number;
}