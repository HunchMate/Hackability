import { DestinationCard } from "@/components/ui/card-21"; // Adjust the import path

const DestinationCardDemo = () => {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row items-center justify-center gap-8 md:gap-12 p-8 bg-background">
      <div className="w-full max-w-[320px] h-[450px]">
        <DestinationCard
          imageUrl="https://images.unsplash.com/photo-1524675053444-52c3ca294ad2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGluZG9uZXNpYXxlbnwwfHwwfHx8MA%3D%3D?q=80&w=1887"
          location="Indonesia"
          flag="🇮🇩"
          stats="1,345 Hotels • 24 Packages"
          href="#"
          // A deep, lush green HSL value
          themeColor="150 50% 25%" 
        />
      </div>
      <div className="w-full max-w-[320px] h-[450px]">
        <DestinationCard
          imageUrl="https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=1887"
          location="Dubai"
          flag="🇦🇪"
          stats="2,345 Hotels • 54 Packages"
          href="#"
          // A rich, twilight purple HSL value
          themeColor="250 50% 30%"
        />
      </div>
    </div>
  );
};

export default DestinationCardDemo;
