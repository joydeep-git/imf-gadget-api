

import { adjectives, starWars, uniqueNamesGenerator } from "unique-names-generator";
import ErrorHandler from "../errorHandlers/errorHandler";



// #### Generate random name
export const randomNameGenerator = (): string => {

  return uniqueNamesGenerator({
    dictionaries: [adjectives, starWars],
    separator: " ",
    length: 2
  });

}


// error response reusable function
export const errRes = (message: string, status: number): ErrorHandler => {
  return new ErrorHandler({ message, status });
}


// test email
export const isValidEmail = (email: string): boolean => {
  
  const re: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return re.test(email);

}



// generate probablity
export const randomProbablityGenerator = (): string => {
  return Math.floor(Math.random() * 100) + 1 + "%";
};



// random code generator
export const randomCodeGenerator = (): number => {
  return Math.floor((Math.random() * Math.random()) * 459852.65);
}
