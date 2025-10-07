import Icons from "@/components/ui/Icons";
import LargeHeading from "@/components/ui/LargeHeading";
import Paragraph from "@/components/ui/Paragraph";
import { Link } from "@/components/ui/Link";
import { FC } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description: "",
};

const PageNotFound: FC = () => {
  return (
    <section className="container mx-auto flex max-w-7xl flex-col items-center gap-6 pt-32 text-center">
      <LargeHeading>Site not found...</LargeHeading>
      <Paragraph>The site you&apos;re searching for does not exist.</Paragraph>
      <Link className="" href="/" variant="blueLink">
        <Icons.ChevronLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
    </section>
  );
};

export default PageNotFound;
