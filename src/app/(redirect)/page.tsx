import { permanentRedirect } from "next/navigation";

export default function LocaleRedirectPage() {
  permanentRedirect("/ko");
}
