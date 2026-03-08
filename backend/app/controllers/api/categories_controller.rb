class Api::CategoriesController < ApplicationController
  before_action :set_category, only: [ :update, :destroy ]

  def index
    categories = Category.order(:name)
    render json: categories
  end

  def create
    category = Category.new(category_params)
    if category.save
      render json: category, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: @category
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    # Using .destroy! would raise an error, .destroy returns false on failure
    if @category.destroy
      head :no_content
    else
      render json: { errors: [ "Cannot delete category while expenses exist" ] }, status: :conflict
    end
  rescue ActiveRecord::InvalidForeignKey
    render json: { error: "Cannot delete category because it is linked to expenses" }, status: :conflict
  end

  private

  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Category not found" }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:name)
  end
end
