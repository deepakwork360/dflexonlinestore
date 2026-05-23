"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  GenderTarget,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@/generated/prisma";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

function imageUrlValues(formData: FormData) {
  const individualUrls = Array.from({ length: 10 }, (_, index) =>
    textValue(formData, `imageUrl${index + 1}`),
  ).filter(Boolean);
  const textareaUrls = textValue(formData, "imageUrls")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
  const legacyUrl = textValue(formData, "imageUrl");
  const urls = [...individualUrls, ...textareaUrls, legacyUrl].filter(Boolean);
  return Array.from(new Set(urls)).slice(0, 10);
}

async function uploadedImageValues(formData: FormData) {
  const files = Array.from({ length: 10 }, (_, index) => formData.get(`photo${index + 1}`))
    .filter((value): value is File => value instanceof File && value.size > 0)
    .filter((file) => file.type.startsWith("image/"));

  if (files.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const fileName = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/products/${fileName}`);
  }

  return urls;
}

async function uploadedBrandLogoValue(formData: FormData) {
  const file = formData.get("logoFile");

  if (!(file instanceof File) || file.size === 0 || !file.type.startsWith("image/")) {
    return null;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "brands");
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/brands/${fileName}`;
}


async function productImageValues(formData: FormData) {
  const uploadedUrls = await uploadedImageValues(formData);
  const pastedUrls = imageUrlValues(formData);
  return Array.from(new Set([...uploadedUrls, ...pastedUrls])).slice(0, 10);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueProductSlug(name: string, excludedProductId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.product.findFirst({
      where: {
        slug,
        ...(excludedProductId ? { id: { not: excludedProductId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function uniqueBrandSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  while (await prisma.brand.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function enumValue<T extends Record<string, string>>(
  source: T,
  value: string,
  fallback: T[keyof T],
) {
  return Object.values(source).includes(value) ? (value as T[keyof T]) : fallback;
}

export async function createProduct(formData: FormData) {
  const name = textValue(formData, "name");
  const description = textValue(formData, "description");
  const imageUrls = await productImageValues(formData);
  const price = textValue(formData, "price");
  const compareAtPrice = optionalTextValue(formData, "compareAtPrice");
  const costPrice = optionalTextValue(formData, "costPrice");
  const sku = optionalTextValue(formData, "sku");
  const brandId = optionalTextValue(formData, "brandId");
  const categoryId = optionalTextValue(formData, "categoryId");
  const gender = enumValue(GenderTarget, textValue(formData, "gender"), GenderTarget.WOMEN);
  const status = enumValue(ProductStatus, textValue(formData, "status"), ProductStatus.DRAFT);

  if (!name || !description || imageUrls.length === 0 || !price) {
    throw new Error("Name, description, at least one image URL, and price are required.");
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: await uniqueProductSlug(name),
      description,
      sku,
      price: new Prisma.Decimal(price),
      compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
      costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
      gender,
      status,
      brandId,
      categoryId,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          altText: `${name} product image`,
          isPrimary: index === 0,
          sortOrder: index + 1,
        })),
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/collections/shoes");
}

export async function updateProduct(formData: FormData) {
  const productId = textValue(formData, "productId");
  const name = textValue(formData, "name");
  const description = textValue(formData, "description");
  const price = textValue(formData, "price");
  const compareAtPrice = optionalTextValue(formData, "compareAtPrice");
  const costPrice = optionalTextValue(formData, "costPrice");
  const sku = optionalTextValue(formData, "sku");
  const brandId = optionalTextValue(formData, "brandId");
  const categoryId = optionalTextValue(formData, "categoryId");
  const gender = enumValue(GenderTarget, textValue(formData, "gender"), GenderTarget.WOMEN);
  const status = enumValue(ProductStatus, textValue(formData, "status"), ProductStatus.DRAFT);
  const primaryImageId = optionalTextValue(formData, "primaryImageId");
  const removeImageIds = formData
    .getAll("removeImageIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  const newImageUrls = await productImageValues(formData);

  if (!productId || !name || !description || !price) {
    throw new Error("Product, name, description, and price are required.");
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const remainingImages = existingProduct.images.filter(
    (image) => !removeImageIds.includes(image.id),
  );

  if (remainingImages.length + newImageUrls.length === 0) {
    throw new Error("At least one product image is required.");
  }

  const slug = await uniqueProductSlug(name, productId);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        description,
        sku,
        price: new Prisma.Decimal(price),
        compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
        costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
        gender,
        status,
        brandId,
        categoryId,
      },
    });

    if (removeImageIds.length > 0) {
      await tx.productImage.deleteMany({
        where: {
          productId,
          id: { in: removeImageIds },
        },
      });
    }

    if (newImageUrls.length > 0) {
      await tx.productImage.createMany({
        data: newImageUrls.map((url, index) => ({
          productId,
          url,
          altText: `${name} product image`,
          isPrimary: false,
          sortOrder: remainingImages.length + index + 1,
        })),
      });
    }

    const finalImages = await tx.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    const finalPrimaryId =
      primaryImageId && finalImages.some((image) => image.id === primaryImageId)
        ? primaryImageId
        : finalImages[0]?.id;

    if (finalPrimaryId) {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
      await tx.productImage.update({
        where: { id: finalPrimaryId },
        data: { isPrimary: true },
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/products/${existingProduct.slug}`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/collections/shoes");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
}

export async function deleteProduct(formData: FormData) {
  const productId = textValue(formData, "productId");

  if (!productId) {
    throw new Error("Product is required.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/collections/shoes");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
  redirect("/admin/products");
}

export async function createBrand(formData: FormData) {
  const name = textValue(formData, "name");
  const description = optionalTextValue(formData, "description");
  const logo = (await uploadedBrandLogoValue(formData)) || optionalTextValue(formData, "logo");

  if (!name) {
    throw new Error("Brand name is required.");
  }

  await prisma.brand.create({
    data: {
      name,
      slug: await uniqueBrandSlug(name),
      description,
      logo,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
  revalidatePath("/collections/shoes");
}

export async function updateProductStatus(formData: FormData) {
  const productId = textValue(formData, "productId");
  const status = enumValue(ProductStatus, textValue(formData, "status"), ProductStatus.DRAFT);

  if (!productId || !status) {
    throw new Error("Product and status are required.");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/collections/shoes");
}

export async function updateVariantStock(formData: FormData) {
  const variantId = textValue(formData, "variantId");
  const stock = Number(textValue(formData, "stock"));

  if (!variantId || !Number.isInteger(stock) || stock < 0) {
    throw new Error("A valid variant and stock quantity are required.");
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function createVariant(formData: FormData) {
  const productId = textValue(formData, "productId");
  let sizeId = textValue(formData, "sizeId");
  const newSizeName = textValue(formData, "newSizeName");
  const newSizeValue = textValue(formData, "newSizeValue");
  const newSizeSystem = textValue(formData, "newSizeSystem") || "US";
  const sku = textValue(formData, "sku");
  const color = textValue(formData, "color");
  const colorHex = optionalTextValue(formData, "colorHex");
  const price = optionalTextValue(formData, "price");
  const compareAtPrice = optionalTextValue(formData, "compareAtPrice");
  const stock = Number(textValue(formData, "stock"));

  if (!sizeId && newSizeName && newSizeValue) {
    const size = await prisma.size.create({
      data: {
        name: newSizeName,
        value: newSizeValue,
        system: newSizeSystem,
      },
    });
    sizeId = size.id;
  }

  if (!productId || !sizeId || !sku || !color || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Product, existing or new size, SKU, color, and valid stock are required.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  await prisma.productVariant.create({
    data: {
      productId,
      sizeId,
      sku,
      color,
      colorHex,
      price: price ? new Prisma.Decimal(price) : null,
      compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
      stock,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/collections/shoes");
}

export async function updateVariantDetails(formData: FormData) {
  const variantId = textValue(formData, "variantId");
  const productId = textValue(formData, "productId");
  const sku = textValue(formData, "sku");
  const color = textValue(formData, "color");
  const colorHex = optionalTextValue(formData, "colorHex");
  const price = optionalTextValue(formData, "price");
  const compareAtPrice = optionalTextValue(formData, "compareAtPrice");
  const stock = Number(textValue(formData, "stock"));

  if (!variantId || !productId || !sku || !color || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Variant, SKU, color, and valid stock are required.");
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku,
      color,
      colorHex,
      price: price ? new Prisma.Decimal(price) : null,
      compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice) : null,
      stock,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = textValue(formData, "orderId");
  const status = enumValue(OrderStatus, textValue(formData, "status"), OrderStatus.PENDING);
  const paymentStatus = enumValue(PaymentStatus, textValue(formData, "paymentStatus"), PaymentStatus.PENDING);
  const trackingNumber = optionalTextValue(formData, "trackingNumber");

  if (!orderId || !status || !paymentStatus) {
    throw new Error("Order, order status, and payment status are required.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      paymentStatus,
      trackingNumber,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

export async function upsertStoreSetting(formData: FormData) {
  const key = textValue(formData, "key");
  const value = textValue(formData, "value");
  const isActive = formData.get("isActive") === "on";

  if (!key || !value) {
    throw new Error("Setting key and value are required.");
  }

  await prisma.storeSetting.upsert({
    where: { key },
    create: { key, value, isActive },
    update: { value, isActive },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/");
}
