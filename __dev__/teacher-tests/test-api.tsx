'use client';

// Simple test component to verify teacher courses API connection
import React from 'react';
import { useGetTeacherCoursesQuery } from '@/lib/redux/api/teacher-courses-api';
import { CourseStatus } from '@/lib/types/course-enums';

export default function TestTeacherCoursesAPI() {
  const { 
    data: coursesResponse, 
    isLoading, 
    isError, 
    error 
  } = useGetTeacherCoursesQuery({
    page: 1,
    limit: 5,
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
    includeTeacher: true,
    includeCategory: true,
  });

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  if (isError) {
    return (
      <div>
        <h3>Error loading courses:</h3>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2>Teacher Courses API Test</h2>
      <p>Total courses: {coursesResponse?.meta?.total}</p>
      <p>Current page: {coursesResponse?.meta?.page}</p>
      
      <h3>Courses:</h3>
      {coursesResponse?.data.map(course => (
        <div key={course.id} className="border p-2 mb-2">
          <h4>{course.title}</h4>
          <p>Status: {course.status}</p>
          <p>Price: {course.isFree ? 'Free' : `${course.currency} ${course.price}`}</p>
          <p>Students: {course.totalEnrollments}</p>
          <p>Rating: {course.rating}</p>
          {course.teacher && (
            <p>Teacher: {course.teacher.firstName} {course.teacher.lastName}</p>
          )}
          {course.category && (
            <p>Category: {course.category.name}</p>
          )}
        </div>
      ))}
    </div>
  );
}