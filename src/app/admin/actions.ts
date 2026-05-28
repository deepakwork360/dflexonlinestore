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
  DiscountType,
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
  redirect(`/admin/products/${product.id}/edit`);
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
  const color = optionalTextValue(formData, "color");
  const colorHex = optionalTextValue(formData, "colorHex");
  const colorGroup = optionalTextValue(formData, "colorGroup");
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
        color,
        colorHex,
        colorGroup,
      },
    });

    // Update existing images color fields
    for (const image of remainingImages) {
      const colorVal = optionalTextValue(formData, `imageColor_${image.id}`);
      await tx.productImage.update({
        where: { id: image.id },
        data: { color: colorVal },
      });
    }

    if (removeImageIds.length > 0) {
      await tx.productImage.deleteMany({
        where: {
          productId,
          id: { in: removeImageIds },
        },
      });
    }

    if (newImageUrls.length > 0) {
      for (let index = 0; index < newImageUrls.length; index++) {
        const url = newImageUrls[index];
        const colorVal = optionalTextValue(formData, `newImageColor_${index}`);
        await tx.productImage.create({
          data: {
            productId,
            url,
            altText: `${name} product image`,
            isPrimary: false,
            sortOrder: remainingImages.length + index + 1,
            color: colorVal,
          },
        });
      }
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

  const variant = await prisma.productVariant.create({
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
    include: { size: true },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/collections/shoes");

  return {
    id: variant.id,
    sizeId: variant.sizeId,
    color: variant.color,
    colorHex: variant.colorHex,
    sku: variant.sku,
    price: variant.price?.toString() ?? null,
    compareAtPrice: variant.compareAtPrice?.toString() ?? null,
    stock: variant.stock,
    size: {
      id: variant.size.id,
      name: variant.size.name,
      value: variant.size.value,
      system: variant.size.system,
    },
  };
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

async function uniqueCategorySlug(name: string, excludedCategoryId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.category.findFirst({
      where: {
        slug,
        ...(excludedCategoryId ? { id: { not: excludedCategoryId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function createCategory(formData: FormData) {
  const name = textValue(formData, "name");
  const description = optionalTextValue(formData, "description");
  const image = optionalTextValue(formData, "image");
  const parentId = optionalTextValue(formData, "parentId");

  if (!name) {
    throw new Error("Category name is required.");
  }

  await prisma.category.create({
    data: {
      name,
      slug: await uniqueCategorySlug(name),
      description,
      image,
      parentId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
}

export async function updateCategory(formData: FormData) {
  const categoryId = textValue(formData, "categoryId");
  const name = textValue(formData, "name");
  const description = optionalTextValue(formData, "description");
  const image = optionalTextValue(formData, "image");
  const parentId = optionalTextValue(formData, "parentId");

  if (!categoryId || !name) {
    throw new Error("Category ID and name are required.");
  }

  if (parentId === categoryId) {
    throw new Error("A category cannot be its own parent.");
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      slug: await uniqueCategorySlug(name, categoryId),
      description,
      image,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
}

export async function deleteCategory(formData: FormData) {
  const categoryId = textValue(formData, "categoryId");

  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/men");
  revalidatePath("/women");
  revalidatePath("/kids");
}

export async function createCoupon(formData: FormData) {
  const code = textValue(formData, "code").toUpperCase();
  const discountType = enumValue(DiscountType, textValue(formData, "discountType"), DiscountType.PERCENTAGE);
  const discountValue = textValue(formData, "discountValue");
  const minOrderValue = optionalTextValue(formData, "minOrderValue");
  const maxDiscount = optionalTextValue(formData, "maxDiscount");
  const startDateStr = textValue(formData, "startDate");
  const endDateStr = textValue(formData, "endDate");
  const usageLimitStr = optionalTextValue(formData, "usageLimit");
  const isActive = formData.get("isActive") === "on";

  if (!code || !discountValue || !startDateStr || !endDateStr) {
    throw new Error("Code, discount value, start date, and end date are required.");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;

  await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue: new Prisma.Decimal(discountValue),
      minOrderValue: minOrderValue ? new Prisma.Decimal(minOrderValue) : null,
      maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : null,
      startDate,
      endDate,
      usageLimit,
      isActive,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/coupons");
}

export async function updateCoupon(formData: FormData) {
  const couponId = textValue(formData, "couponId");
  const code = textValue(formData, "code").toUpperCase();
  const discountType = enumValue(DiscountType, textValue(formData, "discountType"), DiscountType.PERCENTAGE);
  const discountValue = textValue(formData, "discountValue");
  const minOrderValue = optionalTextValue(formData, "minOrderValue");
  const maxDiscount = optionalTextValue(formData, "maxDiscount");
  const startDateStr = textValue(formData, "startDate");
  const endDateStr = textValue(formData, "endDate");
  const usageLimitStr = optionalTextValue(formData, "usageLimit");
  const isActive = formData.get("isActive") === "on";

  if (!couponId || !code || !discountValue || !startDateStr || !endDateStr) {
    throw new Error("Coupon, code, discount value, start date, and end date are required.");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      code,
      discountType,
      discountValue: new Prisma.Decimal(discountValue),
      minOrderValue: minOrderValue ? new Prisma.Decimal(minOrderValue) : null,
      maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : null,
      startDate,
      endDate,
      usageLimit,
      isActive,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  const couponId = textValue(formData, "couponId");

  if (!couponId) {
    throw new Error("Coupon is required.");
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/coupons");
}

export async function validateCoupon(code: string, subtotal: number) {
  if (!code) {
    return { success: false, message: "Please enter a coupon code." };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return { success: false, message: "Invalid coupon code." };
  }

  if (!coupon.isActive) {
    return { success: false, message: "This coupon is no longer active." };
  }

  const now = new Date();
  if (now < coupon.startDate) {
    return { success: false, message: "This coupon has not started yet." };
  }

  if (now > coupon.endDate) {
    return { success: false, message: "This coupon has expired." };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, message: "This coupon has reached its usage limit." };
  }

  const minOrder = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
  if (subtotal < minOrder) {
    return {
      success: false,
      message: `Minimum order value of $${minOrder.toFixed(2)} required to use this coupon.`,
    };
  }

  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
    },
  };
}

export async function createReview(formData: FormData) {
  const productId = textValue(formData, "productId");
  const email = textValue(formData, "email");
  const name = textValue(formData, "name");
  const rating = Number(textValue(formData, "rating") || "5");
  const title = textValue(formData, "title") || null;
  const comment = textValue(formData, "comment") || null;

  if (!productId || !email || !name || !rating) {
    throw new Error("Missing required review fields.");
  }

  // Find or create User by email
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  // Create review
  await prisma.review.create({
    data: {
      productId,
      userId: user.id,
      rating,
      title,
      comment,
      isApproved: true, // Auto-approved for frictionless user experience
      verifiedPurchase: false,
    },
  });

  // Recalculate average rating & review count for the product
  const allReviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    select: { rating: true },
  });

  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const count = allReviews.length;
  const avg = count > 0 ? totalRating / count : 0.0;

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: avg,
      reviewCount: count,
    },
    select: { slug: true },
  });

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/reviews");
}

export async function toggleReviewApproval(formData: FormData) {
  const reviewId = textValue(formData, "reviewId");
  if (!reviewId) {
    throw new Error("Review ID is required.");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      isApproved: !review.isApproved,
    },
  });

  // Recalculate the product ratings
  const allReviews = await prisma.review.findMany({
    where: { productId: review.productId, isApproved: true },
    select: { rating: true },
  });

  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const count = allReviews.length;
  const avg = count > 0 ? totalRating / count : 0.0;

  const product = await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: avg,
      reviewCount: count,
    },
    select: { slug: true },
  });

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(formData: FormData) {
  const reviewId = textValue(formData, "reviewId");
  if (!reviewId) {
    throw new Error("Review ID is required.");
  }

  const review = await prisma.review.delete({
    where: { id: reviewId },
  });

  // Recalculate the product ratings
  const allReviews = await prisma.review.findMany({
    where: { productId: review.productId, isApproved: true },
    select: { rating: true },
  });

  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const count = allReviews.length;
  const avg = count > 0 ? totalRating / count : 0.0;

  const product = await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: avg,
      reviewCount: count,
    },
    select: { slug: true },
  });

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/reviews");
}

export async function createSize(formData: FormData) {
  const name = textValue(formData, "name");
  const value = textValue(formData, "value");
  const system = textValue(formData, "system") || "US";

  if (!name || !value) {
    throw new Error("Name and Value are required for creating a size.");
  }

  const size = await prisma.size.create({
    data: {
      name,
      value,
      system,
    },
  });

  revalidatePath("/admin/sizes");
  revalidatePath("/admin/products");

  return {
    id: size.id,
    name: size.name,
    value: size.value,
    system: size.system,
    _count: { variants: 0 },
  };
}

export async function updateSize(formData: FormData) {
  const sizeId = textValue(formData, "sizeId");
  const name = textValue(formData, "name");
  const value = textValue(formData, "value");
  const system = textValue(formData, "system") || "US";

  if (!sizeId || !name || !value) {
    throw new Error("Size ID, Name, and Value are required for updating a size.");
  }

  const size = await prisma.size.update({
    where: { id: sizeId },
    data: {
      name,
      value,
      system,
    },
  });

  revalidatePath("/admin/sizes");
  revalidatePath("/admin/products");

  return {
    id: size.id,
    name: size.name,
    value: size.value,
    system: size.system,
  };
}

export async function deleteSize(formData: FormData) {
  const sizeId = textValue(formData, "sizeId");
  if (!sizeId) {
    throw new Error("Size ID is required.");
  }

  // Check if size is linked to any active product variants
  const linkedVariantsCount = await prisma.productVariant.count({
    where: { sizeId },
  });

  if (linkedVariantsCount > 0) {
    throw new Error(`Cannot delete this size option because it is currently linked to ${linkedVariantsCount} product variant(s).`);
  }

  await prisma.size.delete({
    where: { id: sizeId },
  });

  revalidatePath("/admin/sizes");
  revalidatePath("/admin/products");
}
