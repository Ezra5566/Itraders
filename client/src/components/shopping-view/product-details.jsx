import { StarIcon, ZoomIn, ZoomOut, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  const images = productDetails?.images || [productDetails?.mainImage];
  const currentImage = images[currentImageIndex];

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setCurrentImageIndex(0);
    setIsZoomed(false);
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg group">
          <div className={cn(
            "relative overflow-hidden transition-transform duration-300",
            isZoomed ? "scale-150" : "scale-100"
          )}>
            <img
              src={currentImage}
              alt={productDetails?.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentImageIndex === index ? "bg-white scale-125" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/80 hover:bg-white"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StarRatingComponent rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-3xl font-bold text-primary",
                productDetails?.salePrice > 0 && "line-through"
              )}
            >
              KSH {productDetails?.price.toLocaleString()}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-2xl font-bold text-red-500">
                KSH {productDetails?.salePrice.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "description" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">{productDetails?.description}</p>
                  {productDetails?.features && (
                    <div>
                      <h3 className="font-semibold mb-2">Key Features</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {productDetails.features.map((feature, index) => (
                          <li key={index} className="text-muted-foreground">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-4">
                  {productDetails?.specifications && (
                    <div className="grid gap-2">
                      {Array.from(productDetails.specifications.entries()).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {productDetails?.dimensions && (
                    <div>
                      <h3 className="font-semibold mb-2">Dimensions</h3>
                      <p className="text-muted-foreground">
                        {productDetails.dimensions.length} x {productDetails.dimensions.width} x {productDetails.dimensions.height} {productDetails.dimensions.unit}
                      </p>
                    </div>
                  )}
                  {productDetails?.weight && (
                    <div>
                      <h3 className="font-semibold mb-2">Weight</h3>
                      <p className="text-muted-foreground">
                        {productDetails.weight.value} {productDetails.weight.unit}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((reviewItem) => (
                        <div key={reviewItem._id} className="flex gap-4">
                          <Avatar className="w-10 h-10 border">
                            <AvatarFallback>
                              {reviewItem?.userName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{reviewItem?.userName}</h3>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <StarRatingComponent rating={reviewItem?.reviewValue} />
                            </div>
                            <p className="text-muted-foreground">
                              {reviewItem.reviewMessage}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No reviews yet</p>
                    )}
                  </div>

                  {user && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Write a review</h3>
                      <div className="flex gap-1">
                        <StarRatingComponent
                          rating={rating}
                          handleRatingChange={handleRatingChange}
                        />
                      </div>
                      <Input
                        name="reviewMsg"
                        value={reviewMsg}
                        onChange={(event) => setReviewMsg(event.target.value)}
                        placeholder="Write a review..."
                      />
                      <Button
                        onClick={handleAddReview}
                        disabled={reviewMsg.trim() === "" || rating === 0}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Separator />

          <div className="flex gap-4">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
