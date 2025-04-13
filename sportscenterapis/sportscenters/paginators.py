from rest_framework import pagination

class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10  # Số bản ghi mỗi trang mặc định
    page_size_query_param = 'page_size'  # Cho phép client thay đổi kích thước trang qua param URL
    max_page_size = 100  # Giới hạn tối đa nếu client yêu cầu quá nhiều
    page_query_param = 'page'  # Param để chọn trang hiện tại