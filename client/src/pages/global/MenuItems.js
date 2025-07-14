import { FaIceCream, FaCoffee, FaWineGlassAlt } from "react-icons/fa";
import { LuSoup } from "react-icons/lu";
import { FaBowlFood, FaBowlRice } from "react-icons/fa6";
import { PiPlantBold } from "react-icons/pi";
import { GiNoodles, GiHotMeal, GiIndiaGate } from "react-icons/gi";
import { ImSpoonKnife } from "react-icons/im";

export const categories = [
  { id: "1", name: "Soups", icon: <LuSoup className="text-lg" /> },
  { id: "2", name: "Biryani", icon: <FaBowlFood className="text-lg" /> },
  { id: "3", name: "Vegetarian", icon: <PiPlantBold className="text-lg" /> },
  { id: "4", name: "Chinese", icon: <GiNoodles className="text-lg" /> },
  { id: "5", name: "Desserts", icon: <FaIceCream className="text-lg" /> },
  { id: "6", name: "Tea / Snacks", icon: <FaCoffee className="text-lg" /> },
  { id: "7", name: "Kebabs", icon: <ImSpoonKnife className="text-lg" /> },
  { id: "8", name: "Indian Special", icon: <GiIndiaGate className="text-lg" /> },
  { id: "9", name: "Thali", icon: <GiHotMeal className="text-lg" /> },
  { id: "10", name: "Beverages", icon: <FaWineGlassAlt className="text-lg" /> },
  { id: "11", name: "Rice", icon: <FaBowlRice className="text-lg" /> },
];
  
  export const menuItems = {
    "1": [
      { id: 101, name: "Clear Soup Veg", price: 5.50, url: "https://images.pexels.com/photos/8738014/pexels-photo-8738014.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 102, name: "Clear Soup Chicken", price: 6.50, url: "https://images.pexels.com/photos/2532442/pexels-photo-2532442.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 103, name: "Sweet Corn Soup Veg", price: 5.50, url: "https://images.pexels.com/photos/13788766/pexels-photo-13788766.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 104, name: "Sweet Corn Soup Chicken", price: 6.50, url: "https://images.pexels.com/photos/2532442/pexels-photo-2532442.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 105, name: "Spicy Soup Veg", price: 5.50, url: "https://images.pexels.com/photos/3493579/pexels-photo-3493579.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 106, name: "Spicy Soup Chicken", price: 6.50, url: "https://images.pexels.com/photos/3493579/pexels-photo-3493579.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "2": [
      { id: 201, name: "Mutton Dhum Biryani", price: 16.90, url: "https://images.pexels.com/photos/14731637/pexels-photo-14731637.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 202, name: "Chicken Dhum Biryani", price: 13.90, url: "https://images.pexels.com/photos/30203313/pexels-photo-30203313/free-photo-of-delicious-grilled-chicken-biryani-platter.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 203, name: "Boneless Chicken Biryani", price: 15.50, url: "https://images.pexels.com/photos/9609862/pexels-photo-9609862.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 204, name: "Mutton Fry Biryani", price: 16.50, url: "https://images.pexels.com/photos/17696653/pexels-photo-17696653/free-photo-of-chicken-wings-in-rice-with-saffron.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 205, name: "Natukodi Biryani", price: 16.50, url: "https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 206, name: "Fish Biryani", price: 16.50, url: "https://images.pexels.com/photos/17649369/pexels-photo-17649369/free-photo-of-meat-with-rice.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "3": [
      { id: 301, name: "Veg Biryani", price: 12.50, url: "https://images.pexels.com/photos/28674544/pexels-photo-28674544/free-photo-of-spicy-indian-rice-dish-with-red-chilies.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 302, name: "Egg Biryani", price: 12.90, url: "https://images.pexels.com/photos/15058974/pexels-photo-15058974/free-photo-of-a-bowl-of-rice-with-tomatoes-and-yogurt.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 303, name: "Brinjal Biryani", price: 12.90, url: "https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 304, name: "Paneer Biryani", price: 13.50, url: "https://images.pexels.com/photos/15058974/pexels-photo-15058974/free-photo-of-a-bowl-of-rice-with-tomatoes-and-yogurt.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "4": [
      { id: 401, name: "Baby Corn", price: 12.50, url: "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 402, name: "Chicken 65", price: 14.50, url: "https://images.pexels.com/photos/1059943/pexels-photo-1059943.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 403, name: "Mutton Keema Balls", price: 16.50, url: "https://images.pexels.com/photos/18698239/pexels-photo-18698239/free-photo-of-food-photography.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 404, name: "Chili Paneer", price: 14.00, url: "https://images.pexels.com/photos/28674541/pexels-photo-28674541/free-photo-of-delicious-paneer-tikka-in-rich-tomato-gravy.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 405, name: "Mushroom Butter Garlic", price: 14.50, url: "https://images.pexels.com/photos/16068663/pexels-photo-16068663/free-photo-of-a-bowl-of-ramen-with-eggs-and-meat.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 406, name: "Gobi Manchurian", price: 12.50, url: "https://images.pexels.com/photos/28674543/pexels-photo-28674543/free-photo-of-spicy-indo-chinese-gobi-manchurian-dish.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "5": [
      { id: 501, name: "Gulab Jamun", price: 4.50, url: "https://images.pexels.com/photos/15014919/pexels-photo-15014919/free-photo-of-bowl-of-gulab-jamun.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 502, name: "Falooda", price: 12.00, url: "https://images.pexels.com/photos/18646641/pexels-photo-18646641/free-photo-of-persian-cold-dessert-falooda.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 503, name: "Apricot Delight", price: 9.00, url: "https://images.pexels.com/photos/1268122/pexels-photo-1268122.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 504, name: "Fruit Salad", price: 12.50, url: "https://images.pexels.com/photos/3085148/pexels-photo-3085148.jpeg?auto=compress&cs=tinysrgb&w=600" },      
    ],
    "6": [
      { id: 601, name: "Samosa", price: 4.00, url: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 602, name: "Onion Pakoda", price: 4.50, url: "https://images.pexels.com/photos/1797171/pexels-photo-1797171.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 603, name: "Tea", price: 3.00, url: "https://images.pexels.com/photos/905485/pexels-photo-905485.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 604, name: "Coffee", price: 3.00, url: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "7": [
      { id: 701, name: "Tandoori", price: 14.50, url: "https://images.pexels.com/photos/8156645/pexels-photo-8156645.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 702, name: "Paneer", price: 15.90, url: "https://images.pexels.com/photos/3928854/pexels-photo-3928854.png?auto=compress&cs=tinysrgb&w=600" },
      { id: 703, name: "Thangadi Kebab", price: 18.00, url: "https://images.pexels.com/photos/53148/shish-kebab-meat-skewer-vegetable-skewer-meat-products-53148.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 704, name: "Murgh Tikka", price: 15.90, url: "https://images.pexels.com/photos/27848435/pexels-photo-27848435/free-photo-of-indian-cuisine.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 705, name: "Lasooni Tikka", price: 15.90, url: "https://images.pexels.com/photos/12312104/pexels-photo-12312104.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 706, name: "Fish Tikka", price: 16.50, url: "https://images.pexels.com/photos/2580464/pexels-photo-2580464.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "8": [
      { id: 801, name: "Paneer Butter Masala", price: 13.50, url: "https://images.pexels.com/photos/9609838/pexels-photo-9609838.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 802, name: "Mushroom Masala", price: 15.00, url: "https://images.pexels.com/photos/28674541/pexels-photo-28674541/free-photo-of-delicious-paneer-tikka-in-rich-tomato-gravy.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 803, name: "Kadai Paneer", price: 14.50, url: "https://images.pexels.com/photos/9609838/pexels-photo-9609838.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 804, name: "Dal Makhani", price: 13.00, url: "https://images.pexels.com/photos/12737916/pexels-photo-12737916.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 805, name: "Chicken Tikka Masala", price: 15.50, url: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 806, name: "Chettinad Chicken", price: 14.00, url: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
    "9": [
      { id: 901, name: "North Indian Thali", price: 12.50, url: "https://images.pexels.com/photos/10078270/pexels-photo-10078270.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 902, name: "Andhra Non Veg Thali", price: 17.50, url: "https://images.pexels.com/photos/10078270/pexels-photo-10078270.jpeg?auto=compress&cs=tinysrgb&w=600" },      
    ],
    "10": [
      { id: 1001, name: "Fresh Juice", price: 4.50, url: "https://images.pexels.com/photos/96620/pexels-photo-96620.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 1002, name: "Lassi", price: 3.90, url: "https://images.pexels.com/photos/4475024/pexels-photo-4475024.jpeg?auto=compress&cs=tinysrgb&w=600" },  
      { id: 1003, name: "Mango Smoothie", price: 8.00, url: "https://images.pexels.com/photos/1251210/pexels-photo-1251210.jpeg?auto=compress&cs=tinysrgb&w=600" },  
    ],
    "11": [
      { id: 1101, name: "Chicken Fried Rice", price: 12.50, url: "https://images.pexels.com/photos/11743998/pexels-photo-11743998.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { id: 1102, name: "Veg Fried Rice", price: 10.50, url: "https://images.pexels.com/photos/5409019/pexels-photo-5409019.jpeg?auto=compress&cs=tinysrgb&w=600" },      
      { id: 1103, name: "Kichidi", price: 10.90, url: "https://images.pexels.com/photos/14731637/pexels-photo-14731637.jpeg?auto=compress&cs=tinysrgb&w=600" },  
    ]
  };