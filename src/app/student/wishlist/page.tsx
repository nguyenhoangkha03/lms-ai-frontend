'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useEnrollInCourseMutation,
} from '@/lib/redux/api/course-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart, ShoppingCart, Trash2, Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'added_date' | 'price' | 'rating'>(
    'added_date'
  );

  const { data: wishlist, isLoading, error } = useGetWishlistQuery();

  const [removeFromWishlist, { isLoading: removing }] =
    useRemoveFromWishlistMutation();
  const [enrollInCourse, { isLoading: enrolling }] =
    useEnrollInCourseMutation();

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (!wishlist) return;

    if (selectedCourses.length === wishlist.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(wishlist.map(item => item.courseId));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedCourses.length === 0) return;

    try {
      await Promise.all(
        selectedCourses.map(courseId => removeFromWishlist(courseId).unwrap())
      );
      setSelectedCourses([]);
      toast.success(
        `Đã xóa ${selectedCourses.length} khóa học khỏi danh sách yêu thích`
      );
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa khóa học');
    }
  };

  const handleEnrollSelected = async () => {
    if (selectedCourses.length === 0) return;

    try {
      const enrollmentPromises = selectedCourses.map(courseId =>
        enrollInCourse({ courseId }).unwrap()
      );

      await Promise.all(enrollmentPromises);
      setSelectedCourses([]);
      toast.success(
        `Đã đăng ký ${selectedCourses.length} khóa học thành công!`
      );
      router.push('/student/courses');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };

  const getTotalPrice = () => {
    if (!wishlist) return 0;

    return selectedCourses.reduce((total, courseId) => {
      const item = wishlist.find(w => w.courseId === courseId);
      return total + (item?.course.isFree ? 0 : item?.course.price || 0);
    }, 0);
  };

  const sortedWishlist = wishlist
    ? [...wishlist].sort((a, b) => {
        switch (sortBy) {
          case 'added_date':
            return (
              new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
            );
          case 'price':
            return a.course.price - b.course.price;
          case 'rating':
            return b.course.rating - a.course.rating;
          default:
            return 0;
        }
      })
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải danh sách yêu thích
          </h2>
          <p className="mb-4 text-gray-600">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Danh sách yêu thích</h1>
          <p className="text-gray-600">Quản lý các khóa học bạn quan tâm</p>
        </div>

        <EmptyState
          icon={<Heart />}
          title="Danh sách yêu thích trống"
          description="Bạn chưa thêm khóa học nào vào danh sách yêu thích. Hãy khám phá và thêm những khóa học bạn quan tâm."
          action={{
            label: 'Khám phá khóa học',
            onClick: () => router.push('/courses'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Danh sách yêu thích</h1>
            <p className="text-gray-600">
              {wishlist.length} khóa học trong danh sách yêu thích
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedCourses.length === wishlist.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedCourses.length > 0
                    ? `Đã chọn ${selectedCourses.length}/${wishlist.length}`
                    : 'Chọn tất cả'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedCourses.length > 0 && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveSelected}
                      disabled={removing}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa ({selectedCourses.length})
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleEnrollSelected}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      Đăng ký ({selectedCourses.length})
                    </Button>
                  </>
                )}

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded border px-3 py-1.5 text-sm"
                >
                  <option value="added_date">Ngày thêm</option>
                  <option value="price">Giá</option>
                  <option value="rating">Đánh giá</option>
                </select>
              </div>
            </div>

            {/* Selected Summary */}
            {selectedCourses.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">
                      Tổng giá: {getTotalPrice().toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="ml-2 text-gray-600">
                      ({selectedCourses.length} khóa học)
                    </span>
                  </div>
                  <Badge variant="secondary">
                    Tiết kiệm được {Math.floor(Math.random() * 20 + 10)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Grid/List */}
      <div
        className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        )}
      >
        {sortedWishlist.map(item => (
          <div key={item.id} className="relative">
            {/* Selection Checkbox */}
            <div className="absolute left-3 top-3 z-10">
              <Checkbox
                checked={selectedCourses.includes(item.courseId)}
                onCheckedChange={() => handleSelectCourse(item.courseId)}
                className="border-2 bg-white/80"
              />
            </div>

            {/* Course Card */}
            <CourseCard
              course={item.course}
              viewMode={viewMode}
              showWishlist={true}
              className="pt-12"
            />

            {/* Added Date */}
            <div className="absolute bottom-3 right-3 rounded bg-white/90 px-2 py-1 text-xs text-gray-600">
              Thêm {new Date(item.addedAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar for Mobile */}
      {selectedCourses.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform sm:hidden">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-medium">
                    {selectedCourses.length} khóa học
                  </div>
                  <div className="text-gray-600">
                    {getTotalPrice().toLocaleString('vi-VN')} ₫
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveSelected}
                    disabled={removing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEnrollSelected}
                    disabled={enrolling}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
