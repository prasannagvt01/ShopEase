package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStreamReader;
import java.io.IOException;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(ProductResponse::fromProduct);
    }

    public ProductResponse getProductById(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return ProductResponse.fromProduct(product);
    }

    public Page<ProductResponse> getProductsByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByFeaturedTrueAndActiveTrue(pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> searchProducts(String query, Pageable pageable) {
        return productRepository.searchByName(query, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> filterByPrice(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> filterByRating(double minRating, Pageable pageable) {
        return productRepository.findByMinRating(minRating, pageable)
                .map(ProductResponse::fromProduct);
    }

    // Admin methods
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .brand(request.getBrand())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .discountPercentage(request.getDiscountPercentage())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .images(request.getImages())
                .stockQuantity(request.getStockQuantity())
                .active(request.isActive())
                .featured(request.isFeatured())
                .tags(request.getTags())
                .specs(Product.ProductSpecs.builder()
                        .weight(request.getWeight())
                        .dimensions(request.getDimensions())
                        .color(request.getColor())
                        .material(request.getMaterial())
                        .warranty(request.getWarranty())
                        .build())
                .build();

        product = productRepository.save(product);
        return ProductResponse.fromProduct(product);
    }

    public ProductResponse updateProduct(String productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategoryId(category.getId());
            product.setCategoryName(category.getName());
        }

        if (request.getName() != null)
            product.setName(request.getName());
        if (request.getDescription() != null)
            product.setDescription(request.getDescription());
        if (request.getBrand() != null)
            product.setBrand(request.getBrand());
        if (request.getPrice() != null)
            product.setPrice(request.getPrice());
        if (request.getDiscountPrice() != null)
            product.setDiscountPrice(request.getDiscountPrice());
        product.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getImages() != null)
            product.setImages(request.getImages());
        product.setStockQuantity(request.getStockQuantity());
        product.setActive(request.isActive());
        product.setFeatured(request.isFeatured());
        if (request.getTags() != null)
            product.setTags(request.getTags());

        if (request.getWeight() != null || request.getDimensions() != null ||
                request.getColor() != null || request.getMaterial() != null ||
                request.getWarranty() != null) {

            Product.ProductSpecs specs = product.getSpecs();
            if (specs == null) {
                specs = new Product.ProductSpecs();
            }
            if (request.getWeight() != null)
                specs.setWeight(request.getWeight());
            if (request.getDimensions() != null)
                specs.setDimensions(request.getDimensions());
            if (request.getColor() != null)
                specs.setColor(request.getColor());
            if (request.getMaterial() != null)
                specs.setMaterial(request.getMaterial());
            if (request.getWarranty() != null)
                specs.setWarranty(request.getWarranty());
            product.setSpecs(specs);
        }

        product = productRepository.save(product);
        return ProductResponse.fromProduct(product);
    }

    public void deleteProduct(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setActive(false);
        productRepository.save(product);
    }

    public void updateProductRating(String productId, double newAverageRating, int reviewCount) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setAverageRating(newAverageRating);
        product.setReviewCount(reviewCount);
        productRepository.save(product);
    }

    public Page<ProductResponse> getAllProductsAdmin(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(ProductResponse::fromProduct);
    }

    public void saveProductsFromCsv(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext(); // skip header
            String[] line;
            while ((line = reader.readNext()) != null) {
                // Format: name, description, price, discountPrice, stockQuantity, categoryName,
                // brand, active, featured, image1, image2, weight, dimensions, color, material
                if (line.length < 5)
                    continue;

                String name = line[0];
                String description = line.length > 1 ? line[1] : "";
                BigDecimal price = new BigDecimal(line[2]);
                BigDecimal discountPrice = (line.length > 3 && !line[3].isEmpty()) ? new BigDecimal(line[3]) : null;
                int stockQuantity = Integer.parseInt(line[4]);
                String categoryName = line[5];
                String brand = line.length > 6 ? line[6] : "";
                boolean active = line.length > 7 && Boolean.parseBoolean(line[7]);
                boolean featured = line.length > 8 && Boolean.parseBoolean(line[8]);

                List<String> images = new ArrayList<>();
                if (line.length > 9 && !line[9].isEmpty())
                    images.add(line[9]);
                if (line.length > 10 && !line[10].isEmpty())
                    images.add(line[10]);

                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.save(Category.builder()
                                .name(categoryName)
                                .slug(categoryName.toLowerCase().replace(" ", "-").replaceAll("[^a-z0-9-]", ""))
                                .active(true)
                                .build()));

                Product product = Product.builder()
                        .name(name)
                        .description(description)
                        .price(price)
                        .discountPrice(discountPrice)
                        .stockQuantity(stockQuantity)
                        .categoryId(category.getId())
                        .categoryName(category.getName())
                        .brand(brand)
                        .active(active)
                        .featured(featured)
                        .images(images)
                        .specs(Product.ProductSpecs.builder()
                                .weight(line.length > 11 ? line[11] : null)
                                .dimensions(line.length > 12 ? line[12] : null)
                                .color(line.length > 13 ? line[13] : null)
                                .material(line.length > 14 ? line[14] : null)
                                .build())
                        .build();

                if (discountPrice != null) {
                    double discountPercentage = ((price.doubleValue() - discountPrice.doubleValue())
                            / price.doubleValue()) * 100;
                    product.setDiscountPercentage((int) Math.round(discountPercentage));
                }

                productRepository.save(product);
            }
        } catch (IOException | CsvValidationException e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
    }
}
