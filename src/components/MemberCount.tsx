import { getTranslations } from "next-intl/server";

type Props = {
  count: number;
  className?: string;
};

export default async function MemberCount({ count, className = "" }: Props) {
  const t = await getTranslations("members");

  return (
    <p className={`text-sm text-muted ${className}`}>
      {count === 0 ? t("empty") : t("count", { count })}
    </p>
  );
}
