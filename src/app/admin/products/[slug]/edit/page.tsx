import { ProductForm } from "@/components/admin/ProductForm";

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { slug } = await params;
  return <ProductForm mode="edit" slug={slug} />;
}