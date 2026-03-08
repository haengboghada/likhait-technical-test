require 'rails_helper'

RSpec.describe Category, type: :model do
  it "prevents duplicate category names" do
    Category.create!(name: "Food")
    duplicate = Category.new(name: "food") # Testing case-insensitivity
    expect(duplicate).not_to be_valid
  end
end
