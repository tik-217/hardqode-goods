import "./styles.css";
import {
  Company,
  Product,
  ProductInformation,
  Review,
  User,
} from "./lib/types";
import { getProducts, getUsers, getReviews, getCompanies } from "./lib/api";
import { useEffect, useState, FC } from "react";
import Card from "./Card";

// Техническое задание:
// Доработать приложение App, чтобы в отрисованном списке
// были реальные отзывы и их авторы,
// а также компания-производитель с названием и годом происхождения,
// Данные об отзывах, пользователях и компаниях можно получить при помощи асинхронных
// функций getUsers, getReviews, getCompanies

// функция getProducts возвращает Promise<Product[]>
// функция getUsers возвращает Promise<User[]>
// функция getReviews возвращает Promise<Review[]>
// функция getCompanies возвращает Promise<Company[]>

// В объектах реализующих интерфейс Product указаны только uuid
// пользователей, обзоров и компаний

// В объектах реализующих интерфейс ProductInformation, ReviewInformation
// указана полная информация об пользователе и обзоре.

const toProductInformation = (
  product: Product,
  users: User[],
  companies: Company[],
  reviews: Review[]
): ProductInformation => {
  const companiesData = companies.find((el) => el.id === product.companyId);
  const reviewsData = reviews.filter((el) => {
    return product.reviewIds.some((reviewId) => el.id === reviewId);
  });
  const usersData = users.find((user) => {
    return reviewsData.filter((review) => review.userId === user.id);
  });

  return {
    id: product.id,
    name: product.name || "Без названия",
    company: {
      name: companiesData !== undefined ? companiesData.name : "",
      id: companiesData !== undefined ? companiesData.id : "",
      country: companiesData !== undefined ? companiesData.country : "",
      created: companiesData !== undefined ? companiesData.created : 0,
    },
    reviews: reviewsData.map((el) => {
      return {
        id: el.id,
        text: el.text,
        user: usersData ? usersData : { id: "", name: "" },
      };
    }),
    description: product.description,
  };
};

const App: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      const fetchedCompanies = await getCompanies();
      setCompanies(fetchedCompanies);
      const fetchedReviews = await getReviews();
      setReviews(fetchedReviews);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Список товаров:</h1>
      {isLoading && <div>Загрузка...</div>}
      {!isLoading &&
        products.map((p) => (
          <Card
            key={p.id}
            product={toProductInformation(p, users, companies, reviews)}
          />
        ))}
    </div>
  );
};

export default App;
