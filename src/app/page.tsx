import GenderCollectionPage from "./[gender]/page";

export default function Home() {
  return (
    <GenderCollectionPage params={Promise.resolve({ gender: "women" })} />
  );
}
