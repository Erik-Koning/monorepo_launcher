import LargeHeading from "@/components/ui/LargeHeading";
import Paragraph from "@/components/ui/Paragraph";

export default async function Home() {
  //redirect("/entries"); //we don't use this page yet

  return (
    <div className="flex flex-col items-center justify-start gap-6 lg:items-start lg:justify-center">
      <LargeHeading size="lg" className="three-d dark:text-light-gold text-black">
        Hello World
      </LargeHeading>

      <Paragraph className="max-w-xl lg:text-left">This is a test</Paragraph>
    </div>
  );
}
