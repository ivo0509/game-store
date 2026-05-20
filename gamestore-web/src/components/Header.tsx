import HeaderNav from "@/components/HeaderNav";
import { getCurrentUser } from "@/services/authService";

export default async function Header() {
  const user = await getCurrentUser();

  return <HeaderNav user={user} />;
}
